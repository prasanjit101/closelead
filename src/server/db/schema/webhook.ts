import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { insertUserSchema, user } from "./user";
import {
  createSelectSchema,
  createUpdateSchema,
  createInsertSchema,
} from "drizzle-zod";
import { z } from "zod";


export const webhooks = sqliteTable("webhooks", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  name: text("name").notNull(),
  webhookUrl: text("webhook_url").notNull(),
  formType: text("form_type").notNull(), // 'typeform' | 'google_forms' | 'custom'
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export const selectWebhookSchema = createSelectSchema(webhooks);
export const insertWebhookSchema = createInsertSchema(webhooks);
export const updateWebhookSchema = createUpdateSchema(webhooks);
export type WebhookInsert = z.infer<typeof insertWebhookSchema>;
export type WebhookUpdate = z.infer<typeof updateWebhookSchema>;
export type WebhookSelect = z.infer<typeof selectWebhookSchema>;
