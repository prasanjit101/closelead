import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import {
  templates,
  insertTemplatesSchema,
  updateTemplatesSchema,
  getTemplateByProjectSchema
} from '@/server/db/schema/templates';
import { and, eq } from 'drizzle-orm';
import { Resource } from '@/utils/permissions';

const resourceName = Resource.CustomField;

export const customFieldRouter = createTRPCRouter({
  /**
   * Create a new custom field for a project
   */
  createTemplate: protectedProcedure
    .input(insertTemplatesSchema)
    .mutation(async ({ ctx, input }) => {
      const newField = await ctx.db
        .insert(templates)
        .values(input)
        .returning()
        .get();

      return newField;
    }),

  /**
   * Get all custom fields for a project
   */
  getTemplatesByProject: protectedProcedure
    .input(getTemplateByProjectSchema)
    .query(async ({ ctx, input }) => {
      if (!input.projectId) {
        return [];
      }
      const fields = await ctx.db
        .select()
        .from(templates)
        .where(
          and(
            eq(templates.projectId, input.projectId),
            eq(templates.type, input.type)
          )
        )
        .all();

      return fields;
    }),

  /**
   * Get a custom field by ID
   */
  getTemplateById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const field = await ctx.db
        .select()
        .from(templates)
        .where(eq(templates.id, input.id))
        .get();

      if (!field) {
        throw new Error('Custom field not found');
      }

      return field;
    }),

  /**
   * Update a custom field
   */
  updateTemplate: protectedProcedure
    .input(updateTemplatesSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      if (!id) {
        throw new Error('Custom field ID is required');
      }
      const updatedField = await ctx.db
        .update(templates)
        .set(data)
        .where(eq(templates.id, id))
        .returning()
        .get();

      return updatedField;
    }),

  /**
   * Delete a custom field
   */
  deleteTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(templates)
        .where(eq(templates.id, input.id))
        .run();
    }),
});
