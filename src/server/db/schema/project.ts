import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { user } from "./user";
import { projectMembers } from "./projectMember"; // Import projectMembers
import { createSelectSchema, createUpdateSchema, createInsertSchema } from 'drizzle-zod';
import { z } from "zod";

export const projectStatusEnum = ["active", "critical", "archived"] as const;

export type ProjectStatus = typeof projectStatusEnum[number];

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => createId()), // Auto-generated CUID
  name: text("name").notNull(),
  description: text("description"),
  ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: 'cascade' }), // Foreign key to user table, cascade delete projects if owner is deleted
  status: text({ enum: projectStatusEnum }).notNull().$defaultFn(() => projectStatusEnum[0]), // Project status (e.g., active, critical, archived)
  metadata: text("metadata"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$onUpdate(() => new Date()),
});

// Define relation: One project belongs to one owner (user) and has many members
export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(user, {
    fields: [projects.ownerId],
    references: [user.id],
    relationName: 'ownedProjects' // Explicit relation name for clarity
  }),
  members: many(projectMembers), // Relation to the members table
}));

export type Project = typeof projects.$inferSelect;

export const selectProjectSchema = createSelectSchema(projects);
export const insertProjectSchema = createInsertSchema(projects).omit({ ownerId: true });
export const updateProjectSchema = createUpdateSchema(projects);
export type ProjectSelect = z.infer<typeof selectProjectSchema>;
export type ProjectInsert = z.infer<typeof insertProjectSchema>;
export type ProjectUpdate = z.infer<typeof updateProjectSchema>;