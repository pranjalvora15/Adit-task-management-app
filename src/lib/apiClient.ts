const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export async function apiRequest<T>(
  method: Method,
  path: string,
  body?: unknown
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('No internet connection. Please check your network and try again.')
  }

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => ({}))
  const serverMessage = (data as { message?: string }).message

  if (res.status === 401) {
    const err = new Error(serverMessage ?? 'Not authenticated')
    err.name = 'AuthError'
    throw err
  }

  if (!res.ok) {
    throw new Error(serverMessage ?? `HTTP ${res.status}`)
  }

  return data as T
}
