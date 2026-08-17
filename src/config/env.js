import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({

    //cors
    CLIENT_URL: z.string().url(),

    PORT: z.string().default("5000"),
    NODE_ENV: z.string().default("development"),

    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().optional(),

    EMAIL_USER: z.string().email(),
    EMAIL_PASS: z.string().min(16),

    // SMTP variables
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number(),
    SMTP_USER: z.string().min(1),
    SMTP_PASS: z.string().min(1),
    SMTP_FROM: z.string().email(),


    JWT_ACCESS_SECRET: z.string().min(10),
    JWT_REFRESH_SECRET: z.string().min(10),

});

export const env = envSchema.parse(process.env);