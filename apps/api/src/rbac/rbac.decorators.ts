import { SetMetadata } from '@nestjs/common'
import type { Permission } from './permissions.js'

export const PERMISSIONS_KEY = 'cofound:permissions'
export const ANONYMOUS_KEY = 'cofound:anonymous'

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions)

export const AllowAnonymous = () => SetMetadata(ANONYMOUS_KEY, true)
