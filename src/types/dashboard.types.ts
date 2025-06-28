import { z } from "zod";

export const projectMembers = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  addedAt: z.date(),
  role: z.string(),
});

export const SettingsViewPropsSchema = z.object({
  project: z.any().optional(), // You may want to replace z.any() with a more specific schema for Project
  members: z.array(projectMembers),
  tasks: z.array(z.any()), // You may want to replace z.any() with a more specific schema for Task
  session: z.any().optional(), // You may want to replace z.any() with a more specific schema for Session
});

export type SettingsViewProps = z.infer<typeof SettingsViewPropsSchema>;
export type ProjectMember = z.infer<typeof projectMembers>;
export type KanbanBoardProps = SettingsViewProps;