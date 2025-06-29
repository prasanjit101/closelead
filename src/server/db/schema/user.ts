import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
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
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  role: text("role").notNull().default("user"),
  banned: integer("banned", { mode: "boolean" }).notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp" }),
});

export type User = typeof user.$inferSelect;
export const selectUserSchema = createSelectSchema(user);
export const insertUserSchema = createInsertSchema(user);
export const updateUserSchema = createUpdateSchema(user);
export type UserInsert = z.infer<typeof insertUserSchema>;
export type UserUpdate = z.infer<typeof updateUserSchema>;
export type UserSelect = z.infer<typeof selectUserSchema>;
