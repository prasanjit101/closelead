import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq, and } from "drizzle-orm";
import {
  integrations,
  integrationTypeSchema,
} from "@/server/db/schema/integrations";
import { createId } from "@paralleldrive/cuid2";
import { composioService } from "@/lib/services/composio";

export const integrationsRouter = createTRPCRouter({
  getUserIntegrations: protectedProcedure.query(async ({ ctx }) => {
    const userIntegrations = await ctx.db
      .select()
      .from(integrations)
      .where(eq(integrations.userId, ctx.session.user.id))
      .orderBy(integrations.createdAt);

    return userIntegrations;
  }),

  getIntegrationByType: protectedProcedure
    .input(z.object({ type: integrationTypeSchema }))
    .query(async ({ ctx, input }) => {
      const integration = await ctx.db
        .select()
        .from(integrations)
        .where(
          and(
            eq(integrations.userId, ctx.session.user.id),
            eq(integrations.type, input.type),
          ),
        )
        .get();

      return integration;
    }),

  initiateGmailConnection: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Check if Gmail integration already exists
      const existingIntegration = await ctx.db
        .select()
        .from(integrations)
        .where(
          and(
            eq(integrations.userId, ctx.session.user.id),
            eq(integrations.type, "gmail"),
          ),
        )
        .get();

      let entityId: string;
      let integrationRecord;

      if (existingIntegration) {
        entityId = existingIntegration.entityId!;
        integrationRecord = existingIntegration;
      } else {
        // Create Composio entity
        const entity = await composioService.createEntity(
          `user_${ctx.session.user.id}_${Date.now()}`,
        );
        entityId = entity.id;

        // Create integration record
        integrationRecord = await ctx.db
          .insert(integrations)
          .values({
            id: createId(),
            userId: ctx.session.user.id,
            type: "gmail",
            name: "Gmail Integration",
            status: "pending",
            entityId: entityId,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
          .get();
      }

      // Initiate connection
      const connectionResponse = await composioService.initiateConnection(
        entityId,
        "gmail",
      );

      // Update integration with connection details
      await ctx.db
        .update(integrations)
        .set({
          connectionId: connectionResponse.connectionId,
          status: "pending",
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, integrationRecord.id));

      return {
        integrationId: integrationRecord.id,
        redirectUrl: connectionResponse.redirectUrl,
        connectionId: connectionResponse.connectionId,
      };
    } catch (error) {
      console.error("Error initiating Gmail connection:", error);
      throw new Error("Failed to initiate Gmail connection");
    }
  }),

  handleConnectionCallback: protectedProcedure
    .input(
      z.object({
        connectionId: z.string(),
        status: z.enum(["success", "error"]),
        error: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Find integration by connection ID
        const integration = await ctx.db
          .select()
          .from(integrations)
          .where(
            and(
              eq(integrations.connectionId, input.connectionId),
              eq(integrations.userId, ctx.session.user.id),
            ),
          )
          .get();

        if (!integration) {
          throw new Error("Integration not found");
        }

        if (input.status === "success") {
          // Test the connection
          const isActive = await composioService.testGmailConnection(
            input.connectionId,
          );

          await ctx.db
            .update(integrations)
            .set({
              status: isActive ? "connected" : "error",
              errorMessage: isActive ? null : "Connection test failed",
              lastSyncAt: isActive ? new Date() : null,
              updatedAt: new Date(),
            })
            .where(eq(integrations.id, integration.id));

          return { success: isActive };
        } else {
          await ctx.db
            .update(integrations)
            .set({
              status: "error",
              errorMessage: input.error || "Connection failed",
              updatedAt: new Date(),
            })
            .where(eq(integrations.id, integration.id));

          return { success: false, error: input.error };
        }
      } catch (error) {
        console.error("Error handling connection callback:", error);
        throw new Error("Failed to handle connection callback");
      }
    }),

  disconnectIntegration: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify integration belongs to user
        const integration = await ctx.db
          .select()
          .from(integrations)
          .where(
            and(
              eq(integrations.id, input.id),
              eq(integrations.userId, ctx.session.user.id),
            ),
          )
          .get();

        if (!integration) {
          throw new Error("Integration not found or unauthorized");
        }

        // Delete connection from Composio if it exists
        if (integration.connectionId) {
          try {
            await composioService.deleteConnection(integration.connectionId);
          } catch (error) {
            console.warn("Failed to delete Composio connection:", error);
          }
        }

        // Update integration status
        await ctx.db
          .update(integrations)
          .set({
            status: "disconnected",
            connectionId: null,
            errorMessage: null,
            lastSyncAt: null,
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("Error disconnecting integration:", error);
        throw new Error("Failed to disconnect integration");
      }
    }),

  testConnection: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify integration belongs to user
        const integration = await ctx.db
          .select()
          .from(integrations)
          .where(
            and(
              eq(integrations.id, input.id),
              eq(integrations.userId, ctx.session.user.id),
            ),
          )
          .get();

        if (!integration || !integration.connectionId) {
          throw new Error("Integration not found or not connected");
        }

        // Test the connection
        const isActive = await composioService.testGmailConnection(
          integration.connectionId,
        );

        // Update integration status
        await ctx.db
          .update(integrations)
          .set({
            status: isActive ? "connected" : "error",
            errorMessage: isActive ? null : "Connection test failed",
            lastSyncAt: isActive ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, input.id));

        return { success: isActive };
      } catch (error) {
        console.error("Error testing connection:", error);
        throw new Error("Failed to test connection");
      }
    }),

  sendTestEmail: protectedProcedure
    .input(
      z.object({
        integrationId: z.string(),
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify integration belongs to user and is connected
        const integration = await ctx.db
          .select()
          .from(integrations)
          .where(
            and(
              eq(integrations.id, input.integrationId),
              eq(integrations.userId, ctx.session.user.id),
              eq(integrations.status, "connected"),
            ),
          )
          .get();

        if (!integration || !integration.connectionId) {
          throw new Error("Integration not found or not connected");
        }

        // Send email via Composio
        const result = await composioService.sendEmail(
          integration.connectionId,
          {
            to: input.to,
            subject: input.subject,
            body: input.body,
          },
        );

        // Update last sync time
        await ctx.db
          .update(integrations)
          .set({
            lastSyncAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, input.integrationId));

        return { success: true, result };
      } catch (error) {
        console.error("Error sending test email:", error);
        throw new Error("Failed to send test email");
      }
    }),
});
