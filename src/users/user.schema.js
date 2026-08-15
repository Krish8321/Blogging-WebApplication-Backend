import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.url().optional()
);

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

    avatarUrl: optionalUrl,

    website: optionalUrl,

    github: optionalUrl,

    linkedin: optionalUrl,

    isPrivate: z
        .boolean()
        .optional(),
}).strict();