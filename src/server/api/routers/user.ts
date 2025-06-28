import { z } from 'zod';

import {
    createTRPCRouter,
    protectedProcedure,
} from '@/server/api/trpc';
import { eq } from 'drizzle-orm';
import { user } from '@/server/db/schema';
import { updateUserSchema } from '@/server/db/schema/user';

export const userRouter = createTRPCRouter({
    updateUser: protectedProcedure
        .input(updateUserSchema)
        .mutation(async ({ ctx, input }) => {

            const updatedUser = await ctx.db
                .update(user)
                .set({ ...input, })
                .where(eq(user.id, ctx.session.user.id))
                .returning()
                .get();

            return updatedUser;
        }),
    getUser: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const u = await ctx.db
                .select()
                .from(user)
                .where(eq(user.id, input.id))
                .get();

            return u;
        }),
});
