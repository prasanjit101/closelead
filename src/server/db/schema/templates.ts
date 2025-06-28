import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { createSelectSchema, createUpdateSchema, createInsertSchema } from 'drizzle-zod';
import { z } from "zod";
import { projects } from "./project";
import { aiField } from "@/types/db.types";

export const customFieldsMetadata = aiField.omit({ value: true });
export const customFieldsMetadataArray = customFieldsMetadata.array();
export const templatesType = ['custom_field'] as const;

export type CustomFieldsMetadata = z.infer<typeof customFieldsMetadata>;
export type CustomFieldsMetadataArray = z.infer<typeof customFieldsMetadataArray>;
export type TemplatesType = typeof templatesType[number];

export const templates = sqliteTable("templates", {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    type: text('type', {enum: templatesType}).notNull(),
    template: text("template", { mode: 'json' }).$type<CustomFieldsMetadataArray>(),
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
    metadata: text("metadata", { mode: 'json' }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$onUpdate(() => new Date()),
});

export const templatesRelations = relations(templates, ({ one }) => ({
    project: one(projects, {
        fields: [templates.projectId],
        references: [projects.id],
    }),
}));

export type Templates = typeof templates.$inferSelect;
export const selectTemplatesSchema = createSelectSchema(templates).extend({
    template: customFieldsMetadataArray.optional(),
});
export const insertTemplatesSchema = createInsertSchema(templates).extend({
    template: customFieldsMetadataArray.optional(),
});
export const updateTemplatesSchema = createUpdateSchema(templates).extend({
    template: customFieldsMetadataArray.optional(),
});
export const getTemplateByProjectSchema = selectTemplatesSchema.pick({projectId: true, type: true});

export type TemplatesSelect = z.infer<typeof selectTemplatesSchema>;
export type TemplatesInsert = z.infer<typeof insertTemplatesSchema>;
export type TemplatesUpdate = z.infer<typeof updateTemplatesSchema>;