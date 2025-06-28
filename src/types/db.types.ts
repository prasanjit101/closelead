import { z } from "zod";

export const aiField = z.object({
    label: z.string(),
    name: z.string(),
    value: z.string().optional(),
    prompt: z.string().max(1000).optional(),
});

export type AiField = z.infer<typeof aiField>;

export const inviteStatus = ["pending", "accepted", "declined", "waiting"] as const;
export type InviteStatus = (typeof inviteStatus)[number];
export const inviteStatusSchema = z.enum(inviteStatus);