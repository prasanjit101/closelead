import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { projects } from "./project";
import { relations } from "drizzle-orm";
import { createSelectSchema, createUpdateSchema, createInsertSchema } from 'drizzle-zod';
import { z } from "zod";
import { taskAssignment } from "./taskAssignment";
import { createId } from "@paralleldrive/cuid2";
import { AiField, aiField } from "@/types/db.types";

export const taskCustomFields = aiField.array();

export const taskStatusArray = ["Planned", "In Progress", "Done", "On Hold"] as const;
export const taskPriorityArray = ["low", "medium", "high", "critical", "Auto"] as const;


export const taskCreatedBySchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string(),
});


export type TaskStatus = typeof taskStatusArray[number];
export type TaskPriority = typeof taskPriorityArray[number];
export type TaskCustomFields = AiField[];
export type TaskCreatedBy = z.infer<typeof taskCreatedBySchema>;



export const task = sqliteTable("task", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  title: text("title").notNull(),
  details: text("details"), // markdown content as string
  priority: text("priority", { enum: taskPriorityArray }).$default(() => 'medium'),
  startAt: integer("start_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  endAt: integer("end_at", { mode: 'timestamp' }),
  projectId: text("project_id").notNull().references(() => projects.id),
  status: text("status", { enum: taskStatusArray }).$default(() => 'Planned').notNull(),
  customFields: text("custom_fields", { mode: 'json' }).$type<TaskCustomFields>(),
  createdBy: text("created_by", { mode: 'json' }).$type<TaskCreatedBy>(),
  metadata: text("metadata", { mode: 'json' }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$onUpdate(() => new Date()),
}, (table) => [
  index("project_idx").on(table.projectId),
  index("status_idx").on(table.status),
  index("priority_idx").on(table.priority)
]
);

export const taskRelations = relations(task, ({ one, many }) => ({
  project: one(projects, {
    fields: [task.projectId],
    references: [projects.id],
  }),
  assignments: many(taskAssignment),
}));

export const selectTaskSchema = createSelectSchema(task);
export const insertTaskSchema = createInsertSchema(task).omit({ title: true })
  .extend({ useAi: z.boolean(), createdBy: taskCreatedBySchema.optional(), customFields: taskCustomFields.optional(), details: z.string(), priority: z.enum(taskPriorityArray).optional() });
export const updateTaskSchema = createUpdateSchema(task).omit({ createdBy: true }).extend({ useAi: z.boolean().optional(), customFields: taskCustomFields.optional() });
export const generatedTaskSchema = createInsertSchema(task).pick({ title: true, details: true, priority: true });


export type Task = typeof task.$inferSelect;
export type TaskInsert = z.infer<typeof insertTaskSchema>;
export type TaskUpdate = z.infer<typeof updateTaskSchema>;
export type TaskSelect = z.infer<typeof selectTaskSchema>;
export type GeneratedTask = z.infer<typeof generatedTaskSchema>;
