export function resolveTenantHint(): string | null {
  if (typeof window === 'undefined') return null

  const host = window.location.hostname
  const envTenant = String(import.meta.env.VITE_TENANT_ID || '').trim().toLowerCase()
  const localFallbackTenant = 'localdev'
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1'

  if (isLocalHost) {
    return envTenant || localFallbackTenant
  }

  if (!host || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return envTenant || null
  const first = host.split('.')[0]
  if (first && first !== 'www') return first.toLowerCase()
  return envTenant || null
}
