import { z } from 'zod';
import {
    createTRPCRouter,
    protectedProcedure,
} from '@/server/api/trpc';
import { insertProjectSchema, projectMembers, projects, updateProjectMemberSchema, user, task } from '@/server/db/schema';
import { eq, desc, and, ne } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { Action, can, PermissionsError, projectMemberRoles, Resource } from '@/utils/permissions';

const resourceName = Resource.Project;

export const projectRouter = createTRPCRouter({
    /**
     * Create a new project.
     * Requires user to be authenticated.
     * Takes project name and optional description as input.
     */
    createProject: protectedProcedure
        .input(insertProjectSchema)
        .mutation(async ({ ctx, input }) => {
            console.log('user id', ctx.session.user.id);
            const newProject = await ctx.db
                .insert(projects)
                .values({
                    id: createId(), // Generate CUID for the new project
                    name: input.name,
                    description: input.description,
                    ownerId: ctx.session.user.id, // Set owner to the current user
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                .returning() // Return the newly created project
                .get(); // Use .get() for SQLite

            // Add the user as a member in projectMembers
            if (newProject && newProject.id) {
                await ctx.db.insert(projectMembers).values({
                    projectId: newProject.id,
                    userId: ctx.session.user.id,
                    role: 'owner', // Set the role to owner
                    addedAt: new Date(),
                }).run();
            }

            return newProject;
        }),

    /**
     * Get all projects owned by the current user.
     * Requires user to be authenticated.
     * Returns projects ordered by creation date descending.
     */
    getProjectsByOwner: protectedProcedure
        .query(async ({ ctx }) => {
            const userProjects = await ctx.db
                .select()
                .from(projects)
                .where(eq(projects.ownerId, ctx.session.user.id))
                .orderBy(desc(projects.createdAt))
                .all(); // Use .all() for SQLite

            return userProjects;
        }),

    /**
     * Get a specific project by its ID.
     * Requires user to be authenticated and be the owner of the project.
     * Takes project ID as input.
     */
    getProjectById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const project = await ctx.db
                .select()
                .from(projects)
                .where(eq(projects.id, input.id)) // Find by project ID only
                .limit(1)
                .get();

            if (!project) {
                throw new Error('Project not found.');
            }

            return project;
        }),

    /**
     * Get a project with its members.
     * Requires user to be authenticated and be the owner of the project.
     * Takes project ID as input.
     */
    getProjectMembersByProjectId: protectedProcedure
        .input(z.object({ id: z.string().optional() }))
        .query(async ({ ctx, input }) => {
            if (!input.id) {
                return [];
            }
            // Get all members with their user details
            const members = await ctx.db
                .select({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    addedAt: projectMembers.addedAt,
                    role: projectMembers.role,
                })
                .from(projectMembers)
                .innerJoin(user, eq(projectMembers.userId, user.id))
                .where(eq(projectMembers.projectId, input.id))
                .all();

            return members;
        }),

    /**
     * Get project with members and tasks in a single query
     */
    getProjectWithDetails: protectedProcedure
        .input(z.object({ id: z.string().optional() }))
        .query(async ({ ctx, input }) => {
            const projectId = input.id ?? ctx.session.user.currProjectId;
            if (!projectId) return null;

            const project = await ctx.db
                .select()
                .from(projects)
                .where(eq(projects.id, projectId))
                .get();

            if (!project) {
                throw new Error('Project not found');
            }

            const [members, tasks] = await Promise.all([
                ctx.db
                    .select({
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        addedAt: projectMembers.addedAt,
                        role: projectMembers.role,
                    })
                    .from(projectMembers)
                    .innerJoin(user, eq(projectMembers.userId, user.id))
                    .where(eq(projectMembers.projectId, projectId))
                    .all(),
                
                ctx.db
                    .select()
                    .from(task)
                    .where(eq(task.projectId, projectId))
                    .all()
            ]);

            return {
                project,
                members,
                tasks
            };
        }),
    /**
     * Update an existing project.
     * Requires user to be authenticated and be the owner of the project.
     * Takes project ID and optional name/description as input.
     */
    updateProject: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1).optional(),
                description: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...updateData } = input;
            // update only if the user is the owner
            const updatedProject = await ctx.db
                .update(projects)
                .set(updateData)
                .where(
                    and(
                        eq(projects.id, id),
                        eq(projects.ownerId, ctx.session.user.id)
                    )
            ) // Ensure the user is the owner
                .returning()
                .get();

            if (!updatedProject) {
                throw new Error('Project not found or you do not have permission to update it.');
            }
            // Return the updated project
            return updatedProject;
        }),

    /**
     * Delete a project.
     * Requires user to be authenticated and be the owner of the project.
     * Takes project ID as input.
     */
    deleteProject: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // Check if the project exists and the user is the owner before deleting
            const existingProject = await ctx.db
                .select({ id: projects.id })
                .from(projects)
                .where(
                    and(
                        eq(projects.id, input.id),
                        eq(projects.ownerId, ctx.session.user.id)
                    )
                )
                .get();

            if (!existingProject) {
                throw new Error('Project not found or you do not have permission to delete it.');
            }

            await ctx.db
                .delete(projects)
                .where(eq(projects.id, input.id)) // No need to check ownerId again
                .run(); // Use .run() for SQLite delete without returning

            return { success: true, projectId: input.id };
        }),

    /**
     * Get all projects the member is part of.
     * Returns projects
     */
    listProjectsByUser: protectedProcedure
        .query(async ({ ctx }) => {
            const memberProjects = await ctx.db
                .select({
                    project: projects,
                })
                .from(projectMembers)
                .innerJoin(projects, eq(projectMembers.projectId, projects.id))
                .where(eq(projectMembers.userId, ctx.session.user.id))
                .all();

            return memberProjects.map((p) => p.project);
        }),

    /**
     * Update a member's role in a project
     * Requires admin/owner permissions
     * Owners cannot be demoted
     */
    updateProjectMemberRole: protectedProcedure
        .input(updateProjectMemberSchema.extend({
            currUserRole: z.enum(projectMemberRoles),
        }))
        .mutation(async ({ ctx, input }) => {
            if (!can(input.currUserRole, Resource.Member, Action.Update)) {
                throw new PermissionsError(input.currUserRole, Action.Update, Resource.Member);
            }
            if (input.role === 'owner') {
                throw new Error('Cannot change a member to owner');
            }
            // Update the role
            await ctx.db
                .update(projectMembers)
                .set({ role: input.role })
                .where(
                    and(
                        eq(projectMembers.projectId, input.projectId!),
                        eq(projectMembers.userId, input.userId!),
                        ne(projectMembers.role, 'owner')
                    )
                )
                .run();

            return { success: true };
        }),

    /**
     * Remove a member from a project
     * Requires admin/owner permissions
     * Owners cannot be removed
     */
    removeProjectMember: protectedProcedure
        .input(z.object({
            projectId: z.string(),
            userId: z.string(),
        }).extend({
            currUserRole: z.enum(projectMemberRoles),
        }))
        .mutation(async ({ ctx, input }) => {
            if (!can(input.currUserRole, Resource.Member, Action.Delete)) {
                throw new PermissionsError(input.currUserRole, Action.Delete, Resource.Member);
            }

            // Remove the member
            const result = await ctx.db
                .delete(projectMembers)
                .where(
                    and(
                        eq(projectMembers.projectId, input.projectId),
                        eq(projectMembers.userId, input.userId),
                        ne(projectMembers.role, 'owner') // Ensure the member is not an owner
                    )
                )
                .run();

            return { success: result.rowsAffected > 0 };
        }),
});
