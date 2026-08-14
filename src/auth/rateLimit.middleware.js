import rateLimit from "express-rate-limit";
import { success } from "zod";

export const apiLimiter = rateLimit({
    windowMs: 15*60*1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many requests. Pease try again later."
    },
});