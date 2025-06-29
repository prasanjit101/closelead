import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq } from "drizzle-orm";
import { webhooks } from "@/server/db/schema/webhook";
import { insertWebhookSchema, updateWebhookSchema } from "@/server/db/schema/webhook";
import { user } from "@/server/db/schema/user";
import { createId } from "@paralleldrive/cuid2";

export const webhookRouter = createTRPCRouter({
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1, "Webhook name is required"),
                webhookUrl: z.string().url("Please enter a valid URL"),
                formType: z.enum(["typeform", "google_forms", "custom"]),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const webhook = await ctx.db
                .insert(webhooks)
                .values({
                    id: createId(),
                    userId: ctx.session.user.id,
                    name: input.name,
                    webhookUrl: input.webhookUrl,
                    formType: input.formType,
                    isActive: true,
                    createdAt: new Date(),
                })
                .returning()
                .get();

            // Update user's onboard status to true after creating first webhook
            await ctx.db
                .update(user)
                .set({ onboard: true })
                .where(eq(user.id, ctx.session.user.id));

            return webhook;
        }),

    getUserWebhooks: protectedProcedure.query(async ({ ctx }) => {
        const userWebhooks = await ctx.db
            .select()
            .from(webhooks)
            .where(eq(webhooks.userId, ctx.session.user.id));

        return userWebhooks;
    }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).optional(),
                webhookUrl: z.string().url().optional(),
                formType: z.enum(["typeform", "google_forms", "custom"]).optional(),
                isActive: z.boolean().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...updateData } = input;

            const updatedWebhook = await ctx.db
                .update(webhooks)
                .set(updateData)
                .where(eq(webhooks.id, id))
                .returning()
                .get();

            return updatedWebhook;
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db
                .delete(webhooks)
                .where(eq(webhooks.id, input.id));

            return { success: true };
        }),
});
