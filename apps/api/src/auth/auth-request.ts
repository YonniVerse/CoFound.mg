export type AuthenticatedUser = {
  userId: string
  platformRole: string
  status: string
  staffRole?: string | null
}

export type AuthenticatedRequest = {
  headers: { authorization?: string }
  user?: AuthenticatedUser
}
