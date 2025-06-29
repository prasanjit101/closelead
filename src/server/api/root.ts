import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { leadRouter, systemRouter, userRouter, agentRouter } from "./routers";
import { webhookRouter } from "./routers/webhook";
import { integrationsRouter } from "./routers/integrations";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  system: systemRouter,
  user: userRouter,
  webhook: webhookRouter,
  lead: leadRouter,
  agent: agentRouter,
  integrations: integrationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);