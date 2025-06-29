export const projectMemberRoles = [
  "owner",
  "admin",
  "member",
  "viewer",
] as const;
export type ProjectMemberRoles = (typeof projectMemberRoles)[number];

export enum Resource {
  Project = "project",
  Member = "member",
  Task = "task",
  Settings = "settings",
  CustomField = "custom_field",
}

export enum Action {
  Create = "create",
  View = "view",
  Update = "update",
  Delete = "delete",
}

export const rolePermissions: Record<
  ProjectMemberRoles,
  Record<Resource, Action[]>
> = {
  owner: {
    [Resource.Project]: [
      Action.Create,
      Action.View,
      Action.Update,
      Action.Delete,
    ],
    [Resource.Member]: [
      Action.Create,
      Action.View,
      Action.Update,
      Action.Delete,
    ],
    [Resource.Task]: [Action.Create, Action.View, Action.Update, Action.Delete],
    [Resource.Settings]: [
      Action.Create,
      Action.View,
      Action.Update,
      Action.Delete,
    ],
    [Resource.CustomField]: [
      Action.Create,
      Action.View,
      Action.Update,
      Action.Delete,
    ],
  },
  admin: {
    [Resource.Project]: [Action.Create, Action.View, Action.Update], // no Delete
    [Resource.Member]: [Action.Create, Action.View, Action.Update], // no Delete
    [Resource.Task]: [Action.Create, Action.View, Action.Update, Action.Delete],
    [Resource.CustomField]: [
      Action.Create,
      Action.View,
      Action.Update,
      Action.Delete,
    ],
    [Resource.Settings]: [Action.View], // can only view settings
  },
  member: {
    [Resource.Project]: [Action.Create, Action.View],
    [Resource.Member]: [Action.View],
    [Resource.Task]: [Action.Create, Action.View, Action.Update, Action.Delete],
    [Resource.CustomField]: [Action.View], // no Delete
    [Resource.Settings]: [Action.View],
  },
  viewer: {
    [Resource.Project]: [Action.Create, Action.View],
    [Resource.Member]: [Action.View],
    [Resource.Task]: [Action.View],
    [Resource.CustomField]: [Action.View], // can only view custom fields
    [Resource.Settings]: [], // cannot access settings at all
  },
};

/**
 * Helper to check permissions
 */
export function can(
  role: ProjectMemberRoles,
  resource: Resource,
  action: Action,
): boolean {
  const actions = rolePermissions[role]?.[resource] || [];
  return actions.includes(action);
}

export class PermissionsError extends Error {
  statusCode: number;
  constructor(role: ProjectMemberRoles, action: Action, resource: Resource) {
    super(
      `Role "${role}" is not allowed to perform "${action}" on resource "${resource}".`,
    );
    this.name = "PermissionsError";
    this.statusCode = 401; // Unauthorized
  }
}

// Example usage
// if (can('admin', Resource.Project, Action.Delete)) {
//   // continue with operation
// } else {
//   // show “not allowed” message
// }
