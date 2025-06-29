import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./user";
import { webhooks } from "./webhook";
import {
  createSelectSchema,
  createUpdateSchema,
  createInsertSchema,
} from "drizzle-zod";
import { z } from "zod";

export const leads = sqliteTable("leads", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  webhookId: text("webhook_id").references(() => webhooks.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  rawData: text("raw_data"), // JSON field for form submission
  score: integer("score"), // 1-10 AI generated score
  status: text("status").default('new'), // 'new' | 'contacted' | 'followed_up' | 'replied' | 'meeting_booked' | 'closed'
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type Lead = typeof leads.$inferSelect;
export const selectLeadSchema = createSelectSchema(leads);
export const insertLeadSchema = createInsertSchema(leads);
export const updateLeadSchema = createUpdateSchema(leads);
export type LeadInsert = z.infer<typeof insertLeadSchema>;
export type LeadUpdate = z.infer<typeof updateLeadSchema>;
export type LeadSelect = z.infer<typeof selectLeadSchema>;