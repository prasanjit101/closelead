import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./user";
import { webhooks } from "./webhook";
import {
    createSelectSchema,
    createUpdateSchema,
    createInsertSchema,
} from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const agentType = ["response_agent", "followup_agent"] as const;
export type AgentType = (typeof agentType)[number];
export const agentTypeSchema = z.enum(agentType);


export const agent = sqliteTable("agent", {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => user.id),
    systemPrompt: text("system_prompt").notNull(),
    type: text("type", { enum: agentType }).notNull(), // 'response_agent', 'followup_agent'
    metadata: text("metadata"), // JSON field for agent metadata
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Agent = typeof agent.$inferSelect;
export const selectAgentSchema = createSelectSchema(agent);
export const insertAgentSchema = createInsertSchema(agent);
export const updateAgentSchema = createUpdateSchema(agent);
export type AgentInsert = z.infer<typeof insertAgentSchema>;
export type AgentUpdate = z.infer<typeof updateAgentSchema>;
export type AgentSelect = z.infer<typeof selectAgentSchema>;