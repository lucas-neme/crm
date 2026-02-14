export function getApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_URL || '').trim()
  const host = window.location.hostname
  const isLocalHost =
    host === 'localhost' || host === '127.0.0.1' || host === '::1'

  // In production, never allow localhost API targets.
  if (!isLocalHost && /^(https?:)?\/\/localhost(?::\d+)?/i.test(raw)) {
    return '/api'
  }

  return raw || '/api'
}

