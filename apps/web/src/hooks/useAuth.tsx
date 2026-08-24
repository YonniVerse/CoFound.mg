/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { apiClient, ApiClientError } from '@/lib/api-client'

type AuthState =
  | { status: 'loading' }
  | { status: 'idle' }
  | { status: 'authenticated'; userId: string }

type AuthContextValue = {
  state: AuthState
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<boolean>
  setAccessToken: (accessToken: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })
  const refreshInFlight = useRef<Promise<boolean> | null>(null)

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.post<{ accessToken: string }>(
      '/auth/login',
      { email, password },
    )
    apiClient.setAccessToken(response.accessToken)
    setState({ status: 'authenticated', userId: '' })
  }, [])

  const setAccessToken = useCallback((accessToken: string) => {
    apiClient.setAccessToken(accessToken)
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
    if (refreshInFlight.current) return refreshInFlight.current

    const request = (async () => {
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
        }
        setState({ status: 'idle' })
        return false
      }
    })()

    refreshInFlight.current = request
    try {
      return await request
    } finally {
      if (refreshInFlight.current === request) refreshInFlight.current = null
    }
  }, [])

  useEffect(() => {
    apiClient.setRefreshHandler(refresh)
    return () => apiClient.setRefreshHandler(null)
  }, [refresh])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const isAuthenticated = state.status === 'authenticated'
  const isLoading = state.status === 'loading'

  const value = useMemo<AuthContextValue>(
    () => ({ state, isAuthenticated, isLoading, login, logout, refresh, setAccessToken }),
    [state, isAuthenticated, isLoading, login, logout, refresh, setAccessToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider.')
  return context
}
