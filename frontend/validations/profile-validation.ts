import { z } from "zod";

/**
 * Editable own-profile fields. Mirrors the Django `ProfileUpdateSerializer`
 * field constraints (display_name ≤ 150, bio ≤ 160). Username is the immutable
 * login identifier and is not editable here.
 */
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .max(150, "Name must be 150 characters or less"),
  bio: z.string().trim().max(160, "Bio must be 160 characters or less"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
