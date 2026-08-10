// const express = require("express");
import express from "express";
import authRoutes from "./auth/auth.routes.js";
import postRoutes from "./posts/post.routes.js";

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

export default app;