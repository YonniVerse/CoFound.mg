/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { apiClient, ApiClientError } from '@/lib/api-client'

type AuthState =
  | { status: 'idle' }
  | { status: 'authenticated'; userId: string }

type AuthContextValue = {
  state: AuthState
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'idle' })

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.post<{ accessToken: string }>(
      '/auth/login',
      { email, password },
    )
    apiClient.setAccessToken(response.accessToken)
    setState({ status: 'authenticated', userId: '' })
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {})
    } catch {
      /* Le logout ne doit jamais bloquer la déconnexion locale */
    }
    apiClient.setAccessToken(null)
    setState({ status: 'idle' })
  }, [])

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const response = await apiClient.post<{ accessToken: string }>(
        '/auth/refresh',
        {},
      )
      apiClient.setAccessToken(response.accessToken)
      setState({ status: 'authenticated', userId: '' })
      return true
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        apiClient.setAccessToken(null)
        setState({ status: 'idle' })
      }
      return false
    }
  }, [])

  const isAuthenticated = state.status === 'authenticated'

  const value = useMemo<AuthContextValue>(
    () => ({ state, isAuthenticated, login, logout, refresh }),
    [state, isAuthenticated, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider.')
  return context
}
