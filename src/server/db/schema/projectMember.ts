import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { user } from "./user";
import { projects } from "./project";
import { createSelectSchema, createUpdateSchema, createInsertSchema } from 'drizzle-zod';
import z from "zod";
import { projectMemberRoles } from "@/utils/permissions";

export const projectMemberMetadata = z.object({
  autoAssignPrompt: z.string().optional(),
});

export type ProjectMemberMetadata = z.infer<typeof projectMemberMetadata>;

export const projectMembers = sqliteTable(
  "project_members",
  {
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }), // Foreign key to projects table
    userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),       // Foreign key to user table
    role: text('role', { enum: projectMemberRoles }).default('member').notNull(),
    metadata: text({ mode: 'json' }).$type<ProjectMemberMetadata>(),
    addedAt: integer("added_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    // Composite primary key to ensure a user is only added once per project
    primaryKey({ columns: [table.projectId, table.userId] }),
  ]
);

// Define relations: Many-to-many between projects and users through this table
export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(user, {
    fields: [projectMembers.userId],
    references: [user.id],
  }),
}));


export type ProjectMember = typeof projectMembers.$inferSelect;
export const selectProjectMemberSchema = createSelectSchema(projectMembers);
export const insertProjectMemberSchema = createInsertSchema(projectMembers);
export const updateProjectMemberSchema = createUpdateSchema(projectMembers);
export type ProjectMemberSelect = z.infer<typeof selectProjectMemberSchema>;
export type ProjectMemberInsert = z.infer<typeof insertProjectMemberSchema>;
export type ProjectMemberUpdate = z.infer<typeof updateProjectMemberSchema>;
export type ProjectMemberRoles = (typeof projectMemberRoles)[number];