import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./user";
import { webhooks } from "./webhook";
import {
  createSelectSchema,
  createUpdateSchema,
  createInsertSchema,
} from "drizzle-zod";
import { z } from "zod";

export const leadStatus = [
  "new",
  "contacted",
  "followed_up",
  "replied",
  "meeting_booked",
  "closed",
] as const;
export type LeadStatus = (typeof leadStatus)[number];
export const leadStatusSchema = z.enum(leadStatus);

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  webhookId: text("webhook_id").references(() => webhooks.id),
  webhookName: text("webhook_name"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  rawData: text("raw_data"), // JSON field for form submission
  score: integer("score"), // 1-10 AI generated score
  scoreBreakdown: text("score_breakdown"), // JSON field for score breakdown
  status: text("status", { enum: leadStatus }).default("new"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

export type Lead = typeof leads.$inferSelect;
export const selectLeadSchema = createSelectSchema(leads);
export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});
export const updateLeadSchema = createUpdateSchema(leads).omit({
  createdAt: true,
  updatedAt: true,
  webhookId: true,
});
export type LeadInsert = z.infer<typeof insertLeadSchema>;
export type LeadUpdate = z.infer<typeof updateLeadSchema>;
export type LeadSelect = z.infer<typeof selectLeadSchema>;
