export const Permission = {
  TALENT_READ: 'talent:read',
  TALENT_REVEAL: 'talent:reveal',
  PROJECT_READ: 'project:read',
  PROJECT_CREATE: 'project:create',
  PROJECT_MANAGE: 'project:manage',
  PROJECT_APPLY: 'project:apply',
  CONNECTION_REQUEST: 'connection:request',
  MESSAGE_SEND: 'message:send',
  ORG_READ: 'org:read',
  ORG_MANAGE: 'org:manage',
  MODERATION_READ: 'moderation:read',
  MODERATION_ACT: 'moderation:act',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]

export const PLATFORM_ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  TALENT: [
    Permission.TALENT_READ,
    Permission.PROJECT_READ,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_APPLY,
    Permission.CONNECTION_REQUEST,
    Permission.MESSAGE_SEND,
  ],
  ORG_MEMBER: [Permission.TALENT_READ, Permission.PROJECT_READ, Permission.ORG_READ],
  STAFF: [Permission.TALENT_READ, Permission.PROJECT_READ, Permission.ORG_READ, Permission.MODERATION_READ],
}
