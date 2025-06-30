import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { user } from "./user";
import {
  createSelectSchema,
  createUpdateSchema,
  createInsertSchema,
} from "drizzle-zod";
import { z } from "zod";

export const integrationTypes = [
  "gmail",
  "outlook",
  "slack",
  "discord",
] as const;
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
  name: text("name").notNull(),
  status: text("status", { enum: integrationStatus })
    .notNull()
    .default("disconnected"),
  connectionId: text("connection_id"), // Composio connection ID
  entityId: text("entity_id"), // Composio entity ID
  metadata: text("metadata"), // JSON field for integration-specific data
  lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
  errorMessage: text("error_message"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
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
export const insertIntegrationSchema = createInsertSchema(integrations);
export const updateIntegrationSchema = createUpdateSchema(integrations);
export type IntegrationInsert = z.infer<typeof insertIntegrationSchema>;
export type IntegrationUpdate = z.infer<typeof updateIntegrationSchema>;
export type IntegrationSelect = z.infer<typeof selectIntegrationSchema>;
