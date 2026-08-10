import {Router} from "express";
import {register, testRedis, verify, login, refreshAccessToken, forgotPassword} from "./auth.service.js"
import {logout, resendOTP, resetPassword} from "./auth.service.js"
import { authMiddleware, requireRole } from "./auth.middleware.js";
// import { success } from "zod";

const router = Router()

// router.post("/register", (req,res) => {
//     res.status(200).json({
//         success: true,
//         message: "Register Route Working!"
//     });
// });

// router.get("/test-redis", testRedis);

router.post("/register", register);

router.post("/verify", verify);

router.post("/login", login);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", logout);

router.post("/resend-otp", resendOTP);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.get("/test-auth", authMiddleware, (req, res) => {
    console.log("Authenticated user : ", req.user);

    return res.status(200).json({
        success: true,
        message: "You passed the authentication middleware",
    });

});

router.get("/test-admin", authMiddleware, requireRole("ADMIN"), (req, res) =>{
    return res.status(200).json({
        success: true,
        message: "Admin Access Granted",
    });
});

export default router;