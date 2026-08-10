import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default("5000"),
    NODE_ENV: z.string().default("development"),

    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().optional(),

    EMAIL_USER: z.string().email(),
    EMAIL_PASS: z.string().min(16),

    JWT_ACCESS_SECRET: z.string().min(10),
    JWT_REFRESH_SECRET: z.string().min(10),
});

export const env = envSchema.parse(process.env);