import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { projects } from "./project";
import { relations } from "drizzle-orm";
import { projectMembers } from "./projectMember";
import { createSelectSchema, createUpdateSchema, createInsertSchema } from 'drizzle-zod';
import { z } from "zod";

export const user = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull(),
    image: text('image'),
  currProjectId: text("curr_project_id"),
    onboard: integer('onboard', { mode: 'boolean' }).default(true),
    company_name: text('company_name'),
    company_website: text('company_website'),
    discovery_source: text('discovery_source'),
    metadata: text('metadata'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
});


// Define relations for the user table
export const userRelations = relations(user, ({ many }) => ({
  ownedProjects: many(projects, { relationName: 'ownedProjects' }), // Projects owned by the user (using the explicit relationName from projects schema)
  projectMemberships: many(projectMembers), // Memberships linking user to projects
}));

export type User = typeof user.$inferSelect;
export const selectUserSchema = createSelectSchema(user);
export const insertUserSchema = createInsertSchema(user);
export const updateUserSchema = createUpdateSchema(user);
export type UserInsert = z.infer<typeof insertUserSchema>;
export type UserUpdate = z.infer<typeof updateUserSchema>;
export type UserSelect = z.infer<typeof selectUserSchema>;