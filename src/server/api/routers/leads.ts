import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { leads } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const leadRouter = createTRPCRouter({
  getLeads: protectedProcedure.query(async ({ ctx }) => {
    const userLeads = await db.query.leads.findMany({
      where: eq(leads.userId, ctx.session.user.id),
      orderBy: (leads, { desc }) => [desc(leads.createdAt)],
    });
    return userLeads;
  }),
});
