export type AuthenticatedUser = {
  userId: string
  platformRole: string
  status: string
}

export type AuthenticatedRequest = {
  headers: { authorization?: string }
  user?: AuthenticatedUser
}
