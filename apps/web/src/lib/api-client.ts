import { apiErrorSchema, type ApiError } from '@cofound/shared'

export type Schema<T> = { parse: (value: unknown) => T }
type RefreshHandler = () => Promise<boolean>

type ApiClientErrorInput = {
  code?: ApiError['code'] | 'HTTP_ERROR'
  messageKey?: string
  details?: Record<string, unknown>
}

export class ApiClientError extends Error {
  readonly code: ApiError['code'] | 'HTTP_ERROR'
  readonly messageKey: string
  readonly details?: Record<string, unknown>
  readonly status: number

  constructor(status: number, error: ApiClientErrorInput) {
    super(error.messageKey ?? 'errors.internal')
    this.name = 'ApiClientError'
    this.status = status
    this.code = error.code ?? 'HTTP_ERROR'
    this.messageKey = error.messageKey ?? 'errors.internal'
    this.details = error.details
  }
}

export class ApiClient {
  private readonly baseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '')
  private accessToken: string | null = null
  private refreshHandler: RefreshHandler | null = null
  private refreshInFlight: Promise<boolean> | null = null

  setAccessToken(token: string | null) {
    this.accessToken = token
  }

  setRefreshHandler(handler: RefreshHandler | null) {
    this.refreshHandler = handler
  }

  async request<T>(path: string, options: RequestInit = {}, schema?: Schema<T>, allowRefresh = true): Promise<T> {
    const headers = new Headers(options.headers)
    if (options.body && !(options.body instanceof FormData) && !headers.has('content-type')) headers.set('content-type', 'application/json')
    if (this.accessToken) headers.set('authorization', `Bearer ${this.accessToken}`)

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })

    const raw = await response.text()
    const payload: unknown = raw ? this.parseJson(raw) : undefined
    if (!response.ok) {
      const error = this.toApiError(response.status, payload)
      if (response.status === 401 && allowRefresh && this.canRefreshPath(path) && await this.tryRefresh()) {
        return this.request(path, options, schema, false)
      }
      throw error
    }

    return schema ? schema.parse(payload) : (payload as T)
  }

  get<T>(path: string, schema?: Schema<T>) {
    return this.request(path, { method: 'GET' }, schema)
  }

  post<T>(path: string, body: unknown, schema?: Schema<T>) {
    return this.request(path, { method: 'POST', body: JSON.stringify(body) }, schema)
  }

  patch<T>(path: string, body: unknown, schema?: Schema<T>) {
    return this.request(path, { method: 'PATCH', body: JSON.stringify(body) }, schema)
  }

  delete<T>(path: string, schema?: Schema<T>) {
    return this.request(path, { method: 'DELETE' }, schema)
  }

  async getText(path: string, allowRefresh = true): Promise<string> {
    const headers = new Headers()
    if (this.accessToken) headers.set('authorization', `Bearer ${this.accessToken}`)
    const response = await fetch(`${this.baseUrl}${path}`, { method: 'GET', headers, credentials: 'include' })
    if (!response.ok) {
      const raw = await response.text()
      const error = this.toApiError(response.status, raw ? this.parseJson(raw) : undefined)
      if (response.status === 401 && allowRefresh && this.canRefreshPath(path) && await this.tryRefresh()) {
        return this.getText(path, false)
      }
      throw error
    }
    return response.text()
  }

  private canRefreshPath(path: string): boolean {
    return this.refreshHandler !== null && !path.startsWith('/auth/')
  }

  private async tryRefresh(): Promise<boolean> {
    if (!this.refreshHandler) return false
    if (!this.refreshInFlight) {
      const handler = this.refreshHandler
      this.refreshInFlight = handler().catch(() => false).finally(() => {
        this.refreshInFlight = null
      })
    }
    return this.refreshInFlight
  }

  private toApiError(status: number, payload: unknown): ApiClientError {
    const parsed = apiErrorSchema.safeParse(payload)
    if (parsed.success) return new ApiClientError(status, parsed.data)
    return new ApiClientError(status, { code: 'HTTP_ERROR', messageKey: 'errors.http' })
  }

  private parseJson(raw: string): unknown {
    try {
      return JSON.parse(raw) as unknown
    } catch {
      return { code: 'INTERNAL_ERROR', messageKey: 'errors.invalidJson' }
    }
  }
}

export const apiClient = new ApiClient()
