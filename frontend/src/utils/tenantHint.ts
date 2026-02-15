export function resolveTenantHint(): string | null {
  if (typeof window === 'undefined') return null

  const host = window.location.hostname
  const envTenant = String(import.meta.env.VITE_TENANT_ID || '').trim().toLowerCase()
  const fallbackTenant = 'crm'
  const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1'

  if (isLocalHost) {
    return envTenant || fallbackTenant
  }

  if (!host || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return envTenant || fallbackTenant
  const first = host.split('.')[0]
  if (first && first !== 'www') return first.toLowerCase()
  return envTenant || fallbackTenant
}
