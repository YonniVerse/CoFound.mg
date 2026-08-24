export function getJwtSecret(): Uint8Array {
  const configuredSecret = process.env.JWT_SECRET
  if (configuredSecret) return new TextEncoder().encode(configuredSecret)
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET est obligatoire en production.')
  }
  return new TextEncoder().encode('cofound-local-development-secret-change-me')
}
