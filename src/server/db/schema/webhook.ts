import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "./user";
import {
  createSelectSchema,
  createUpdateSchema,
  createInsertSchema,
} from "drizzle-zod";
import { z } from "zod";

export const webhooks = sqliteTable("webhooks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  webhookUrl: text("webhook_url").notNull(),
  webhookSecret: text("webhook_secret"), // New field for webhook secret
  formType: text("form_type").notNull(), // 'typeform' | 'google_forms' | 'custom' | 'tally'
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Define many:1 relationship - many webhooks belong to one user
export const webhookRelations = relations(webhooks, ({ one }) => ({
  user: one(user, {
    fields: [webhooks.userId],
    references: [user.id],
  }),
}));

export type Webhook = typeof webhooks.$inferSelect;
export const selectWebhookSchema = createSelectSchema(webhooks);
export const insertWebhookSchema = createInsertSchema(webhooks);
export const updateWebhookSchema = createUpdateSchema(webhooks);
export type WebhookInsert = z.infer<typeof insertWebhookSchema>;
export type WebhookUpdate = z.infer<typeof updateWebhookSchema>;
export type WebhookSelect = z.infer<typeof selectWebhookSchema>;