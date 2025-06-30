import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq } from "drizzle-orm";
import { webhooks } from "@/server/db/schema/webhook";
import { user } from "@/server/db/schema/user";
import { createId } from "@paralleldrive/cuid2";
import { env } from "@/env";

// Helper function to generate webhook secret
function generateWebhookSecret(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper function to generate webhook URL
function generateWebhookUrl(webhookId: string): string {
  return `${env.NEXT_PUBLIC_APP_URL}/api/webhook/${webhookId}`;
}

export const webhookRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Webhook name is required"),
        formType: z.enum(["typeform", "google_forms", "custom", "tally"]),
        webhookSecret: z.string().optional(),
        scoringPrompt: z.string().min(1, "Scoring prompt is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const webhookId = createId();
      const webhookSecret = input.webhookSecret || generateWebhookSecret();
      const webhookUrl = generateWebhookUrl(webhookId);

      const webhook = await ctx.db
        .insert(webhooks)
        .values({
          id: webhookId,
          userId: ctx.session.user.id,
          name: input.name,
          webhookUrl,
          webhookSecret,
          formType: input.formType,
          scoringPrompt: input.scoringPrompt,
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
      .where(eq(webhooks.userId, ctx.session.user.id))
      .orderBy(webhooks.createdAt);

    return userWebhooks;
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        formType: z
          .enum(["typeform", "google_forms", "custom", "tally"])
          .optional(),
        webhookSecret: z.string().optional(),
        scoringPrompt: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      // Verify webhook belongs to user
      const existingWebhook = await ctx.db
        .select()
        .from(webhooks)
        .where(eq(webhooks.id, id))
        .get();

      if (!existingWebhook || existingWebhook.userId !== ctx.session.user.id) {
        throw new Error("Webhook not found or unauthorized");
      }

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
      // Verify webhook belongs to user
      const existingWebhook = await ctx.db
        .select()
        .from(webhooks)
        .where(eq(webhooks.id, input.id))
        .get();

      if (!existingWebhook || existingWebhook.userId !== ctx.session.user.id) {
        throw new Error("Webhook not found or unauthorized");
      }

      await ctx.db.delete(webhooks).where(eq(webhooks.id, input.id));

      return { success: true };
    }),

  regenerateSecret: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify webhook belongs to user
      const existingWebhook = await ctx.db
        .select()
        .from(webhooks)
        .where(eq(webhooks.id, input.id))
        .get();

      if (!existingWebhook || existingWebhook.userId !== ctx.session.user.id) {
        throw new Error("Webhook not found or unauthorized");
      }

      const newSecret = generateWebhookSecret();

      const updatedWebhook = await ctx.db
        .update(webhooks)
        .set({ webhookSecret: newSecret })
        .where(eq(webhooks.id, input.id))
        .returning()
        .get();

      return updatedWebhook;
    }),
});
