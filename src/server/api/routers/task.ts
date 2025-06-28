import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { insertTaskSchema, task, TaskCustomFields, taskStatusArray, updateTaskSchema } from '@/server/db/schema/task';
import { eq } from 'drizzle-orm';
import { Resource } from '@/utils/permissions';
import { generateTitle, generateTasks, decidePriority } from '@/server/core/task';

const resourceName = Resource.Task;

export const taskRouter = createTRPCRouter({
  /**
   * List all tasks for a given project
   */
  listTasksByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const projectTasks = await ctx.db
        .select()
        .from(task)
        .where(eq(task.projectId, input.projectId))
        .all();
      return projectTasks;
    }),
  /**
   * Create a new task
   */
  createTask: protectedProcedure
    .input(insertTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const { useAi, priority: inputPriority, details, ...rest } = input;
      const createdBy = {
        id: ctx.session?.user.id!,
        name: ctx.session?.user.name!,
        email: ctx.session?.user.email!,
        image: ctx.session?.user.image!,
      };
      // Generate title using AI

      let tasksToCreate = [];

      if (useAi) {
        // Generate multiple tasks
        const subTasks = await generateTasks(details);
        tasksToCreate = subTasks.map(subTask => ({
          ...subTask,
          ...rest,
          createdBy,
          projectId: input.projectId, // Ensure project ID is set
        }));
      } else {
        const title = await generateTitle(details);

        // Create single task
        const priority = inputPriority === "Auto"
          ? await decidePriority(details)
          : inputPriority;


        tasksToCreate.push({
          title,
          details,
          priority,
          ...rest,
          createdBy,
          projectId: input.projectId,
        });
      }

      // Insert tasks into database
      const createdTasks = await ctx.db
        .insert(task)
        .values(tasksToCreate)
        .returning()
        .all();

      return createdTasks;
    }),
  /**
   * Update an existing task
   */
  updateTask: protectedProcedure
    .input(updateTaskSchema)
    .mutation(async ({ ctx, input }) => {
      const parsed = updateTaskSchema.parse(input);
      const taskId = parsed.id!;
      const updatedTask = await ctx.db
        .update(task)
        .set({ ...parsed, customFields: parsed.customFields as TaskCustomFields })
        .where(eq(task.id, taskId))
        .returning()
        .get();
      return updatedTask;
    }),

  /**
   * Update task status
   */
  updateTaskStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(taskStatusArray)
    }))
    .mutation(async ({ ctx, input }) => {
      const updatedTask = await ctx.db
        .update(task)
        .set({ status: input.status })
        .where(eq(task.id, input.id))
        .returning()
        .get();
      return updatedTask;
    }),
  /**
   * Delete a task
   */
  deleteTask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(task)
        .where(eq(task.id, input.id));
    }),
  /**
   * Get a task by ID
   */
  getTaskById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const t = await ctx.db
        .select()
        .from(task)
        .where(eq(task.id, input.id))
        .get();
      return t;
    }),
  });
