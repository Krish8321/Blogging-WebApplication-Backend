import { success, z } from "zod";
import prisma from "../config/database.js";
import redisClient from "../config/redis.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import transporter from "../config/mail.js";
import { sendVerificationEmail,sendPasswordResetEmail } from "../config/mail.js";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";
import { generateAccessToken,generateRefreshToken } from "../utils/jwt.js";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  username: z
    .string()
    .min(3, "Username must be be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters"),

  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name cannot exceed 50 characters"),
});

export const testRedis = async (req, res) => {
  try {
    // await redisClient.set("message", "Hello Batman From Redis!! ");
    await redisClient.del("message");
    const value = await redisClient.get("message");

    return res.status(200).json({
      success: true,
      value,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const register = async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.flatten().fieldErrors,
      });
    }

    const { email, password, username, displayName } = result.data;

    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    const existingUsername = await prisma.profile.findUnique({
      where: {
        username,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email Already Exists!",
      });
    }

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username already taken.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // console.log(passwordHash);

    const otp = crypto.randomInt(100000, 1000000).toString();
    // console.log(otp);

    // console.log("We sent OTP here Because Gmail service is under contrsuction");
    // console.log("Your OTP is here : ", otp);

    const userData = {
      username,
      displayName,
      email,
      password: passwordHash,
      otp,
    };

    await redisClient.set(`verify:${email}`, JSON.stringify(userData), {
      EX: 300,
    });

    try {
      sendVerificationEmail({
        email,
        displayName,
        otp,
      });
    } catch (err) {
      await redisClient.del(`verify:${email}`);

      return res.status(500).json({
        success: false,
        message: "Failed to send verification email",
      });
    }

    // const data = await redisClient.get(`verify:${email}`);
    // console.log(JSON.parse(data));

    // console.log("Email : ",email);
    // console.log("Password : ",password);
    // console.log("Username : ",username);
    // console.log("DisplayName : ",displayName);

    return res.status(200).json({
      success: true,
      message: "Verification mail send Successfully.",
      otp: otp,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

const verifySchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const verify = async (req, res) => {
  try {
    // console.log(req.body);
    const result = verifySchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error.flatten().fieldErrors,
      });
    }

    const {email, otp} = result.data;

    const tempUser = await redisClient.get(`verify:${email}`);

    if(!tempUser){
        return res.status(401).json({
            success: false,
            message: "OTP expired OR Verification data not found",
        });
    }

    const userData = JSON.parse(tempUser);

    if(userData.otp !== otp){
        return res.status(402).json({
            success: false,
            message: "Invalid OTP",
        });
    }

    
    // adding data to the database using prisma Transaction
    
    await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                email: userData.email,
                passwordHash: userData.password,
                isVerified: true,
            },
        });

        await tx.profile.create({
            data: {
                userId: user.id,
                username: userData.username,
                displayName: userData.displayName,
            },
        });
    });

    await redisClient.del(`verify:${email}`);    
    
    return res.status(201).json({
        success: true,
        message: "Email verified Succesfully, Account created",
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const loginSchema = z.object({
  email: z.string().email("Invalid Email"),
  password: z.string().min(8,"Password must be at least 8 characters"),
});


// Login Route 

export const login = async (req, res) =>{
  try{
    const result = loginSchema.safeParse(req.body);

    if(!result.success){
      return res.status(400).json({
        success: false,
        message: result.error.flatten().fieldErrors,
      });
    }

    const {email, password} = result.data;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

  // email is present in DB or NOT
    if(!user){
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

  // user is verified or not 
    if(!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before loggin in",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password, user.passwordHash
    );

    if(!isPasswordValid){
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    const refreshTokenExpiry = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    // console.log("AccessToken : ", accessToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Logged-in Successfully!!!!",
      accessToken,
    });

  }catch (err){
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// const refreshTokenSchema = z.object({
//   refreshToken: z.string().min(1, "Refresh Token is required"),
// });

export const refreshAccessToken = async (req, res) => {
  try{

    // const result = refreshTokenSchema.safeParse(req.body);
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
      return res.status(400).json({
        success: false,
        message: "RefreshToken is required",
      });
    }

    // const { refreshToken } = result.data;

    try{
        const decode = jwt.verify(
          refreshToken, env.JWT_REFRESH_SECRET
        );
    } catch(err){
      if(err.name === "TokenExpiredError"){
        return res.status(401).json({
          success: false,
          message: "Refresh Token expired",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      })
    }

    // console.log("Decoded refresh Token : ", decode);

    const storedToken = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      }
    });

    if(!storedToken){
      return res.status(401).json({
        success: false,
        message: "Invalid Refresh Token",
      });
    }

    if(storedToken.expiresAt < Date.now()){
      return res.status(401).json({
        success: false,
        message: "Session/Refresh token expired",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: storedToken.userId,
      }
    });

    if(!user){
      return res.status(401).json({
        success: false,
        message: "User Not Found",
      });
    }

    const newAccessToken = generateAccessToken(user);

    const newRefreshToken = generateRefreshToken(user);

    const newRefreshTokenExpiry = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.delete({
        where: {
          id: storedToken.id,
        },
      });

      await tx.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
          expiresAt: newRefreshTokenExpiry,
        },
      });
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      accessToken: newAccessToken,
    });

  }catch (err){
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error(refreshToken)",
    });
  }
} 

export const logout = async (req, res) => {
  try{
    // const {refreshToken} = req.body;
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
      return res.status(400).json({
        success: false,
        message: "Refresh token is required!",
      });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
    });

    if(!storedToken){
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    await prisma.refreshToken.delete({
      where: {
        token: refreshToken,
      },
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout Successfully!",
    });

  }catch(err){
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const resendOTP = async (req, res) => {
  try{
    const { email } = req.body;

    if(!email){
      return res.status(400).json({
        success: false,
        message: "Email is required!",
      });
    }

    const tempUser = await redisClient.get(`verify:${email}`);

    if(!tempUser){
      return res.status(404).json({
        success: false,
        message: "Verification data not found or expired",
      });
    }

    const userData = JSON.parse(tempUser);

    const newOtp = crypto.randomInt(100000, 1000000).toString();

    userData.otp = newOtp;

    await redisClient.set(
      `verify:${email}`,
      JSON.stringify(userData),
      {
        EX: 300,
      }
    );

    try {
      sendVerificationEmail({
        email: userData.email,
        displayName: userData.displayName,
        otp : newOtp,
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: "Failed to send newOtp email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully",
    });

  }catch (err){
    console.error(err);

    return res.status(500).json({
        success: false,
        message: "Internal Server Error(resendOTP)",
      });
  }

}

export const forgotPassword = async (req, res) => {
  try{
    const { email } = req.body;

    if(!email){
      return res.status(400).json({
        success: false,
        message: "Email required!",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
      }
    });

    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetOtp = crypto.randomInt(100000, 1000000).toString();

    await redisClient.set(
      `reset:${email}`,
      resetOtp,
      {
        EX: 300,
      }
    );

    await sendPasswordResetEmail({
      email: user.email,
      displayName: user.profile.displayName,
      otp: resetOtp,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset OTP send Successfully",
    });

  }catch (err){
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error (Forgot-password)",
    });
  }
}

export const resetPassword = async (req, res) => {
  try{

    const { email, otp, newPassword } = req.body;

    if(!email || !otp || !newPassword){
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    const storedOtp = await redisClient.get(`reset:${email}`);
    console.log(storedOtp);

    if (!storedOtp) {
      return res.status(401).json({
        success: false,
        message: "OTP expired or reset request not found",
      });
    }

    if(storedOtp !== otp){
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
          success: false,
          message: "User not found",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword,10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    });

    await redisClient.del(`reset:${email}`);

    // revokig all the sessions after password change 
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password Changed Successfully",
    });

  }catch (err){
    console.error(err);

    return res.status(500).json({
      success: false,
      messsage: "Internal Server error(resetPassword)",
    });
  }
}

