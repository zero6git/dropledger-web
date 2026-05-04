const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function apiFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `API ${res.status}`)
  }
  return res.json()
}

export const api = {
  get:    (path: string, token: string) => apiFetch(path, token),
  post:   (path: string, token: string, body: unknown) => apiFetch(path, token, { method: 'POST', body: JSON.stringify(body) }),
  put:    (path: string, token: string, body: unknown) => apiFetch(path, token, { method: 'PUT',  body: JSON.stringify(body) }),
  delete: (path: string, token: string) => apiFetch(path, token, { method: 'DELETE' }),
}
