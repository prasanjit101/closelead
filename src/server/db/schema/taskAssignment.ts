import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "./user";
import { task } from "./task";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const taskAssignment = sqliteTable("task_assignment", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  taskId: text("task_id").notNull(),
  userId: text("user_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const taskAssignmentRelations = relations(taskAssignment, ({ one }) => ({
  task: one(task, {
    fields: [taskAssignment.taskId],
    references: [task.id],
  }),
  user: one(user, {
    fields: [taskAssignment.userId],
    references: [user.id],
  })
}));
