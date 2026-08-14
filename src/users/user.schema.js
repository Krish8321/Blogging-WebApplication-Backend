import { z } from "zod";

export const updateProfileSchema = z.object({
    displayName: z
        .string()
        .min(2, "Display name must be at least 2 characters")
        .max(255, "Display name is too long")
        .optional(),

    bio: z
        .string()
        .max(500, "Bio cannot exceed 500 characters")
        .optional(),

    avatarUrl: z
        .url("Invalid avatar URL")
        .optional(),

    website: z
        .url("Invalid website URL")
        .optional(),

    github: z
        .url("Invalid GitHub URL")
        .optional(),

    linkedin: z
        .url("Invalid LinkedIn URL")
        .optional(),

    isPrivate: z
        .boolean()
        .optional(),
}).strict();