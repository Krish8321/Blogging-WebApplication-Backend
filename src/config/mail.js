import nodemailer from "nodemailer";
import { env } from "./env.js";

const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: env.EMAIL_USER,
//     pass: env.EMAIL_PASS,
//   },
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },

});

export default transporter;

export const sendVerificationEmail = async ({ email, displayName, otp }) => {
  await transporter.sendMail({
    from: `"Ink." <${env.SMTP_FROM}>`,
    to: email,
    subject: "Verify Your Ink. account !!",
    html: `
            <h2>Welcome to Ink.- Bespoke Stories</h2>

            <p>Hello <strong>${displayName}</strong>,</p>

            <p>
            Thank you for creating your account.
            </p>

            <p>Your verification code is:</p>

            <h1>${otp}</h1>

            <p>
            This OTP will expire in <strong>10 minutes</strong>.
            </p>

            <p>
            If you didn't create this account, you can safely ignore this email.
            </p>

            <hr>

            <p>Team Ink.</p>
        `,
  });
};

export const sendPasswordResetEmail = async ({ email, displayName, otp }) => {
    await transporter.sendMail({
        from: `"Ink." <${env.SMTP_FROM}>`,
        to: email,
        subject: "Reset Your Ink.",
        html: `
            <h2>Password Reset Request</h2>

            <p>Hello <strong>${displayName}</strong>,</p>

            <p>
                We received a request to reset your password.
            </p>

            <p>Your password reset OTP is:</p>

            <h1>${otp}</h1>

            <p>
                This OTP will expire in <strong>2 minutes</strong>.
            </p>

            <p>
                If you didn't request a password reset,
                you can safely ignore this email.
            </p>

            <hr>

            <p>Team Ink.</p>
        `,
    });
};