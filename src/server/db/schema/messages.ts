import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./user";
import { leads } from "./leads";
import {
  createSelectSchema,
  createUpdateSchema,
  createInsertSchema,
} from "drizzle-zod";
import { z } from "zod";


export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  leadId: text("lead_id").references(() => leads.id),
  userId: text("user_id").references(() => user.id),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  sentAt: integer("sent_at", { mode: "timestamp" }).notNull(),
  status: text("status"), // 'sent' | 'failed'
});

export type Message = typeof messages.$inferSelect;
export const selectMessageSchema = createSelectSchema(messages);
export const insertMessageSchema = createInsertSchema(messages);
export const updateMessageSchema = createUpdateSchema(messages);
export type MessageInsert = z.infer<typeof insertMessageSchema>;
export type MessageUpdate = z.infer<typeof updateMessageSchema>;
export type MessageSelect = z.infer<typeof selectMessageSchema>;