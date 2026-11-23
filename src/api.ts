const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')

export const TOKEN_KEY = 'ims_token'
export const USER_KEY = 'ims_user'

// Calls the backend with the saved token and returns the parsed JSON.
// Throws an Error with the backend's message when the request fails.
export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(`${API_URL}/api${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    // Token expired or account deactivated: clear the session and go to login
    if (res.status === 401 && token) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      window.location.href = '/login'
    }
    throw new Error(data.message || `Request failed (${res.status})`)
  }
  return data as T
}
