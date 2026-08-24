import { apiErrorSchema, type ApiError } from '@cofound/shared'

export type Schema<T> = { parse: (value: unknown) => T }

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

class ApiClient {
  private readonly baseUrl = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, '')
  private accessToken: string | null = null

  setAccessToken(token: string | null) {
    this.accessToken = token
  }

  async request<T>(path: string, options: RequestInit = {}, schema?: Schema<T>): Promise<T> {
    const headers = new Headers(options.headers)
    if (options.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
    if (this.accessToken) headers.set('authorization', `Bearer ${this.accessToken}`)

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    })

    const raw = await response.text()
    const payload: unknown = raw ? this.parseJson(raw) : undefined
    if (!response.ok) {
      const parsed = apiErrorSchema.safeParse(payload)
      if (parsed.success) throw new ApiClientError(response.status, parsed.data)
      throw new ApiClientError(response.status, { code: 'HTTP_ERROR', messageKey: 'errors.http' })
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

  private parseJson(raw: string): unknown {
    try {
      return JSON.parse(raw) as unknown
    } catch {
      return { code: 'INTERNAL_ERROR', messageKey: 'errors.invalidJson' }
    }
  }
}

export const apiClient = new ApiClient()
