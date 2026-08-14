// const express = require("express");
import express from "express";
import authRoutes from "./auth/auth.routes.js";
import postRoutes from "./posts/post.routes.js";
import userRoutes from "./users/user.routes.js";
import commentRoutes from "./comments/comment.routes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Blog Backend API is running."
    });
});

app.use("/api/auth", authRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/users", userRoutes);

app.use("/api/comments", commentRoutes);

export default app;