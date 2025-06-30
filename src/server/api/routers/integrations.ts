import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { eq, and } from "drizzle-orm";
import {
  integrations,
  integrationTypeSchema,
} from "@/server/db/schema/integrations";
import { createId } from "@paralleldrive/cuid2";
import { composioService } from "@/lib/services/composio";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";

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
    const userId = ctx.session.user.id;

    try {
      // Check if user already has a Gmail integration
      const existingIntegration = await ctx.db
        .select()
        .from(integrations)
        .where(
          and(eq(integrations.userId, userId), eq(integrations.type, "gmail")),
        )
        .get();

      // Create or get entity for user
      const entityId = userId; // Using userId as entityId for simplicity

      try {
        await composioService.getEntity(entityId);
      } catch (_error) {
        // Entity doesn't exist, create it
        await composioService.createEntity(entityId);
      }

      // Initiate connection with Composio
      const connectionResponse = await composioService.initiateConnection(
        entityId,
        env.COMPOSIO_INTEGRATION_ID,
      );

      if (existingIntegration) {
        // Update existing integration
        await ctx.db
          .update(integrations)
          .set({
            status: "pending",
            connectionId: connectionResponse.connectionId,
            errorMessage: null,
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, existingIntegration.id));
      } else {
        // Create new integration
        await ctx.db.insert(integrations).values({
          id: createId(),
          userId,
          type: "gmail",
          status: "pending",
          connectionId: connectionResponse.connectionId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return {
        redirectUrl: connectionResponse.redirectUrl,
        connectionId: connectionResponse.connectionId,
      };
    } catch (error) {
      console.error("Error initiating Gmail connection:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to initiate Gmail connection",
      });
    }
  }),

  checkConnectionStatus: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const connection = await composioService.getConnection(
          input.connectionId,
        );

        // Update integration status in database
        const integration = await ctx.db
          .select()
          .from(integrations)
          .where(
            and(
              eq(integrations.userId, ctx.session.user.id),
              eq(integrations.connectionId, input.connectionId),
            ),
          )
          .get();

        if (integration) {
          const status =
            connection.status === "ACTIVE"
              ? "connected"
              : connection.status === "ERROR"
                ? "error"
                : "pending";

          await ctx.db
            .update(integrations)
            .set({
              status,
              updatedAt: new Date(),
            })
            .where(eq(integrations.id, integration.id));
        }

        return {
          status: connection.status,
          isActive: connection.status === "ACTIVE",
        };
      } catch (error) {
        console.error("Error checking connection status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check connection status",
        });
      }
    }),

  disconnectGmail: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const integration = await ctx.db
        .select()
        .from(integrations)
        .where(
          and(
            eq(integrations.userId, ctx.session.user.id),
            eq(integrations.type, "gmail"),
          ),
        )
        .get();

      if (!integration) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Gmail integration not found",
        });
      }

      // Delete connection from Composio if it exists
      if (integration.connectionId) {
        try {
          await composioService.deleteConnection(integration.connectionId);
        } catch (error) {
          console.error("Error deleting Composio connection:", error);
          // Continue with local cleanup even if Composio deletion fails
        }
      }

      // Update integration status
      await ctx.db
        .update(integrations)
        .set({
          status: "disconnected",
          connectionId: null,
          errorMessage: null,
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, integration.id));

      return { success: true };
    } catch (error) {
      console.error("Error disconnecting Gmail:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to disconnect Gmail",
      });
    }
  }),

  testGmailConnection: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const integration = await ctx.db
        .select()
        .from(integrations)
        .where(
          and(
            eq(integrations.userId, ctx.session.user.id),
            eq(integrations.type, "gmail"),
            eq(integrations.status, "connected"),
          ),
        )
        .get();

      if (!integration || !integration.connectionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No active Gmail connection found",
        });
      }

      const isWorking = await composioService.testGmailConnection(
        integration.connectionId,
      );

      return { success: isWorking };
    } catch (error) {
      console.error("Error testing Gmail connection:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to test Gmail connection",
      });
    }
  }),
});
