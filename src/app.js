// const express = require("express");
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { apiLimiter } from "./auth/rateLimit.middleware.js";

import authRoutes from "./auth/auth.routes.js";
import postRoutes from "./posts/post.routes.js";
import userRoutes from "./users/user.routes.js";
import commentRoutes from "./comments/comment.routes.js";

const app = express();

app.use(
    cors({
        origin: env.CLIENT_URL,
        credentials: true,
    })
);

// middlewares
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Blog Backend API is running."
    });
});

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "healthy",
        message: "Blog Backend API is healthy",
        timestamp: new Date().toISOString(),
    });
});


app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/users", userRoutes);

app.use("/api/comments", commentRoutes);

export default app;