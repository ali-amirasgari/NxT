import { z } from "zod";

export const groupChatMemberSchema = z.object({
  id: z.string().trim().min(1, "Member id is required"),
  name: z.string().trim().min(1, "Member name is required"),
  initial: z.string().trim().min(1, "Member initial is required").max(2, "Member initial must be 2 characters or less"),
  role: z.enum(["member", "admin"]),
});

export const groupChatSchema = z.object({
  name: z.string().trim().min(2, "Group name must be at least 2 characters").max(60, "Group name must be 60 characters or less"),
  imageDataUrl: z.string().trim().startsWith("data:image/", "Group image must be a valid image data URL").optional(),
  members: z
    .array(groupChatMemberSchema)
    .min(1, "Select at least one member")
    .refine(
      (members) => members.some((member) => member.role === "admin"),
      {
        message: "Select at least one admin",
      },
    ),
});

export type GroupChatMemberFormValues = z.infer<typeof groupChatMemberSchema>;
export type GroupChatFormValues = z.infer<typeof groupChatSchema>;
