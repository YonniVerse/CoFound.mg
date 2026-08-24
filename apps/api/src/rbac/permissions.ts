export const Permission = {
  TALENT_READ: 'talent:read',
  TALENT_SELF: 'talent:self',
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
  ORGANIZATION_REQUEST_READ: 'organization-request:read',
  ORGANIZATION_REQUEST_MANAGE: 'organization-request:manage',
  ORGANIZATION_CAPABILITY_MANAGE: 'organization-capability:manage',
  AUDIT_READ: 'audit:read',
  REFERENCE_DATA_MANAGE: 'reference-data:manage',
  PRODUCT_HEALTH_READ: 'product-health:read',
} as const

export type Permission = (typeof Permission)[keyof typeof Permission]

export const PLATFORM_ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  TALENT: [
    Permission.TALENT_READ,
    Permission.TALENT_SELF,
    Permission.PROJECT_READ,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_MANAGE,
    Permission.PROJECT_APPLY,
    Permission.CONNECTION_REQUEST,
    Permission.MESSAGE_SEND,
  ],
  ORG_MEMBER: [Permission.TALENT_READ, Permission.PROJECT_READ, Permission.ORG_READ],
  STAFF: [Permission.TALENT_READ, Permission.PROJECT_READ, Permission.ORG_READ, Permission.MODERATION_READ, Permission.AUDIT_READ],
}
