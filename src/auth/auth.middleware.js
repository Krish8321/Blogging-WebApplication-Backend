import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authMiddleware = (req, res, next) => {
    try{
        // we needed the access token inside the header 
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({
                success: false,
                message: "Authorization Header missing!",
            });
        }

        if (!authHeader.startsWith("Bearer")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format",
            });
        }
        // console.log("Authorization Header : ", authHeader);

        const token = authHeader.split(" ")[1];
        // console.log(token);

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Access Token Missing",
            });
        }

        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
        // console.log("decoded token: ", decoded);    

        req.user = decoded;

        next();

    }catch (err){
        console.error(err);

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Access token expired",
            });
        }

        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid access token",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error(Middleware)",
        })
    }
}

export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: insufficient permissions",
            });
        }

        next();
    };
};

export const getPostMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            req.user = null;
            return next();
        }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            env.JWT_ACCESS_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        console.error("GET POST MIDDLEWARE ERROR",error);
        req.user = null;
        next();
    }
};