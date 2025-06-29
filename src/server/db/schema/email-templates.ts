import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./user";
import {
  createSelectSchema,
  createUpdateSchema,
  createInsertSchema,
} from "drizzle-zod";
import { z } from "zod";


export const emailTemplates = sqliteTable("email_templates", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(), // supports {{name}}, {{company}} variables
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export const selectEmailTemplateSchema = createSelectSchema(emailTemplates);
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates);
export const updateEmailTemplateSchema = createUpdateSchema(emailTemplates);
export type EmailTemplateInsert = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplateUpdate = z.infer<typeof updateEmailTemplateSchema>;
export type EmailTemplateSelect = z.infer<typeof selectEmailTemplateSchema>;