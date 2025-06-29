import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq, and } from "drizzle-orm";
import { agent, agentWebhooks, agentTypeSchema, agentLinkSchema } from "@/server/db/schema/agent";
import { webhooks } from "@/server/db/schema/webhook";
import { createId } from "@paralleldrive/cuid2";

export const agentRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1, "Agent name is required"),
                description: z.string().optional(),
                systemPrompt: z.string().min(1, "System prompt is required"),
                type: agentTypeSchema,
                webhookIds: z.array(z.string()).min(1, "At least one webhook must be selected"),
                metadata: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const agentId = createId();

            // Create the agent
            const newAgent = await ctx.db
                .insert(agent)
                .values({
                    id: agentId,
                    userId: ctx.session.user.id,
                    name: input.name,
                    description: input.description,
                    systemPrompt: input.systemPrompt,
                    type: input.type,
                    metadata: input.metadata,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning()
                .get();

            // Create agent-webhook relationships
            if (input.webhookIds.length > 0) {
                await ctx.db
                    .insert(agentWebhooks)
                    .values(
                        input.webhookIds.map(webhookId => ({
                            agentId,
                            webhookId,
                        }))
                    );
            }

            return newAgent;
        }),

    getUserAgents: protectedProcedure.query(async ({ ctx }) => {
        // Get agents with their associated webhooks
        const userAgents = await ctx.db
            .select()
            .from(agent)
            .where(eq(agent.userId, ctx.session.user.id))
            .orderBy(agent.createdAt);

        // Get webhooks for each agent
        const agentsWithWebhooks = await Promise.all(
            userAgents.map(async (agentItem) => {
                const agentWebhookData = await ctx.db
                    .select({
                        id: webhooks.id,
                        name: webhooks.name,
                        formType: webhooks.formType,
                    })
                    .from(agentWebhooks)
                    .innerJoin(webhooks, eq(agentWebhooks.webhookId, webhooks.id))
                    .where(eq(agentWebhooks.agentId, agentItem.id));

                return {
                    ...agentItem,
                    webhooks: agentWebhookData,
                };
            })
        );

        return agentsWithWebhooks;
    }),

    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const agentData = await ctx.db
                .select()
                .from(agent)
                .where(and(eq(agent.id, input.id), eq(agent.userId, ctx.session.user.id)))
                .get();

            if (!agentData) {
                throw new Error("Agent not found or unauthorized");
            }

            // Get associated webhooks
            const agentWebhookData = await ctx.db
                .select({
                    id: webhooks.id,
                    name: webhooks.name,
                    formType: webhooks.formType,
                })
                .from(agentWebhooks)
                .innerJoin(webhooks, eq(agentWebhooks.webhookId, webhooks.id))
                .where(eq(agentWebhooks.agentId, input.id));

            return {
                ...agentData,
                webhooks: agentWebhookData,
            };
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).optional(),
                description: z.string().optional(),
                systemPrompt: z.string().min(1).optional(),
                type: agentTypeSchema.optional(),
                webhookIds: z.array(z.string()).optional(),
                metadata: z.string().optional(),
                isActive: z.boolean().optional(),
                links: z.array(agentLinkSchema).optional(), // Add links to the update schema
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, webhookIds, ...updateData } = input;

            // Verify agent belongs to user
            const existingAgent = await ctx.db
                .select()
                .from(agent)
                .where(and(eq(agent.id, id), eq(agent.userId, ctx.session.user.id)))
                .get();

            if (!existingAgent) {
                throw new Error("Agent not found or unauthorized");
            }

            // Update agent
            const updatedAgent = await ctx.db
                .update(agent)
                .set({
                    ...updateData,
                    updatedAt: new Date(),
                })
                .where(eq(agent.id, id))
                .returning()
                .get();

            // Update webhook relationships if provided
            if (webhookIds !== undefined) {
                // Delete existing relationships
                await ctx.db
                    .delete(agentWebhooks)
                    .where(eq(agentWebhooks.agentId, id));

                // Create new relationships
                if (webhookIds.length > 0) {
                    await ctx.db
                        .insert(agentWebhooks)
                        .values(
                            webhookIds.map(webhookId => ({
                                agentId: id,
                                webhookId,
                            }))
                        );
                }
            }

            return updatedAgent;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Verify agent belongs to user
            const existingAgent = await ctx.db
                .select()
                .from(agent)
                .where(and(eq(agent.id, input.id), eq(agent.userId, ctx.session.user.id)))
                .get();

            if (!existingAgent) {
                throw new Error("Agent not found or unauthorized");
            }

            // Delete agent (cascade will handle agent_webhooks)
            await ctx.db
                .delete(agent)
                .where(eq(agent.id, input.id));

            return { success: true };
        }),
});
