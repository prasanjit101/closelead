import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "./user";
import {
  createSelectSchema,
  createUpdateSchema,
  createInsertSchema,
} from "drizzle-zod";
import { z } from "zod";

export const integrationTypes = ["gmail"] as const;
export type IntegrationType = (typeof integrationTypes)[number];
export const integrationTypeSchema = z.enum(integrationTypes);

export const integrationStatus = [
  "connected",
  "disconnected",
  "error",
  "pending",
] as const;
export type IntegrationStatus = (typeof integrationStatus)[number];
export const integrationStatusSchema = z.enum(integrationStatus);

export const integrations = sqliteTable("integrations", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type", { enum: integrationTypes }).notNull(),
  status: text("status", { enum: integrationStatus })
    .notNull()
    .default("disconnected"),
  connectionId: text("connection_id"), // Composio connection ID
  metadata: text("metadata"), // JSON field for integration-specific data
  errorMessage: text("error_message"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// Relations
export const integrationsRelations = relations(integrations, ({ one }) => ({
  user: one(user, {
    fields: [integrations.userId],
    references: [user.id],
  }),
}));

export type Integration = typeof integrations.$inferSelect;
export const selectIntegrationSchema = createSelectSchema(integrations);
export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});
export const updateIntegrationSchema = createUpdateSchema(integrations);
export type IntegrationInsert = z.infer<typeof insertIntegrationSchema>;
export type IntegrationUpdate = z.infer<typeof updateIntegrationSchema>;
export type IntegrationSelect = z.infer<typeof selectIntegrationSchema>;
