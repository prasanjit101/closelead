import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { user } from "./user";
import { webhooks } from "./webhook";
import {
  createSelectSchema,
  createUpdateSchema,
  createInsertSchema,
} from "drizzle-zod";
import { z } from "zod";

export const agentType = ["response_agent", "followup_agent"] as const;
export type AgentType = (typeof agentType)[number];
export const agentTypeSchema = z.enum(agentType);

export const agentLinkSchema = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string().optional(),
});
export type AgentLink = z.infer<typeof agentLinkSchema>;

export const agent = sqliteTable("agent", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  systemPrompt: text("system_prompt").notNull(),
  type: text("type", { enum: agentType }).notNull(),
  links: text("links", { mode: "json" }).$type<AgentLink[]>(), // JSON field for agent links
  metadata: text("metadata"), // JSON field for agent metadata
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// Junction table for many-to-many relationship between agents and webhooks
export const agentWebhooks = sqliteTable(
  "agent_webhooks",
  {
    agentId: text("agent_id")
      .references(() => agent.id, { onDelete: "cascade" })
      .notNull(),
    webhookId: text("webhook_id")
      .references(() => webhooks.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.agentId, table.webhookId] })],
);

// Relations
export const agentRelations = relations(agent, ({ one, many }) => ({
  user: one(user, {
    fields: [agent.userId],
    references: [user.id],
  }),
  agentWebhooks: many(agentWebhooks),
}));

export const agentWebhooksRelations = relations(agentWebhooks, ({ one }) => ({
  agent: one(agent, {
    fields: [agentWebhooks.agentId],
    references: [agent.id],
  }),
  webhook: one(webhooks, {
    fields: [agentWebhooks.webhookId],
    references: [webhooks.id],
  }),
}));

export type Agent = typeof agent.$inferSelect;
export type AgentWithWebhooks = Agent & {
  webhooks: Array<{
    id: string;
    name: string;
    formType: string;
  }>;
};

export const selectAgentSchema = createSelectSchema(agent);
export const insertAgentSchema = createInsertSchema(agent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});
export const updateAgentSchema = createUpdateSchema(agent);
export type AgentInsert = z.infer<typeof insertAgentSchema>;
export type AgentUpdate = z.infer<typeof updateAgentSchema>;
export type AgentSelect = z.infer<typeof selectAgentSchema>;
