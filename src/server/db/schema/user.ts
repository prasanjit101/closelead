import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import {
  createSelectSchema,
  createUpdateSchema,
  createInsertSchema,
} from "drizzle-zod";
import { z } from "zod";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  onboard: integer("onboard", { mode: "boolean" }).default(false),
  metadata: text("metadata"),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
  role: text("role").notNull().default("user"),
  banned: integer("banned", { mode: "boolean" }).notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp" }),
});

// Define 1:many relationship - one user can have many webhooks
export const userRelations = relations(user, ({ many }) => ({
  webhooks: many(webhooks),
}));

export type User = typeof user.$inferSelect;
export const selectUserSchema = createSelectSchema(user);
export const insertUserSchema = createInsertSchema(user).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateUserSchema = createUpdateSchema(user);
export type UserInsert = z.infer<typeof insertUserSchema>;
export type UserUpdate = z.infer<typeof updateUserSchema>;
export type UserSelect = z.infer<typeof selectUserSchema>;

// Import webhooks table for the relation
import { webhooks } from "./webhook";
