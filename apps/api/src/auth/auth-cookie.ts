const REFRESH_COOKIE = 'cofound_refresh_token'
const REFRESH_COOKIE_PATH = '/api/v1/auth'
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60

export function serializeRefreshCookie(token: string, expiresAt: Date, env: NodeJS.ProcessEnv = process.env): string {
  const isProduction = env.NODE_ENV === 'production'
  const sameSite = isProduction ? 'None' : 'Lax'
  const secure = isProduction ? '; Secure' : ''
  return `${REFRESH_COOKIE}=${token}; HttpOnly; Path=${REFRESH_COOKIE_PATH}; SameSite=${sameSite}; Max-Age=${REFRESH_COOKIE_MAX_AGE}; Expires=${expiresAt.toUTCString()}${secure}`
}

export function serializeExpiredRefreshCookie(env: NodeJS.ProcessEnv = process.env): string {
  const isProduction = env.NODE_ENV === 'production'
  const sameSite = isProduction ? 'None' : 'Lax'
  const secure = isProduction ? '; Secure' : ''
  return `${REFRESH_COOKIE}=; HttpOnly; Path=${REFRESH_COOKIE_PATH}; Max-Age=0; SameSite=${sameSite}${secure}`
}
