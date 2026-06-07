import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .regex(/^@[a-zA-Z0-9_]+$/, "Use @ followed by letters, numbers, or underscores"),
  bio: z.string().trim().max(160, "Bio must be 160 characters or less"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
