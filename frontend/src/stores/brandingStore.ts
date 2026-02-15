import { ref } from 'vue'
import { getApiBaseUrl } from '../utils/apiBase'
import { resolveTenantHint } from '../utils/tenantHint'

export interface BrandingSettings {
  nomeCRM: string
  logoUrl: string
  ownerPhotoUrl: string
  ownerName: string
  logoScale: number
  logoOffsetX: number
  logoOffsetY: number
  slogan: string
  ownerDescription: string
  email: string
  telefone: string
  endereco: string
  website: string
  cnpj: string
}

const STORAGE_KEY = 'crm.branding'

const defaultBranding: BrandingSettings = {
  nomeCRM: 'CRM',
  logoUrl: '',
  ownerPhotoUrl: '',
  ownerName: '',
  logoScale: 100,
  logoOffsetX: 0,
  logoOffsetY: 0,
  slogan: '',
  ownerDescription: '',
  email: '',
  telefone: '',
  endereco: '',
  website: '',
  cnpj: '',
}

function persistLocal(data: BrandingSettings) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

const carregarBranding = (): BrandingSettings => {
  if (typeof window === 'undefined') return defaultBranding
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultBranding
    return { ...defaultBranding, ...JSON.parse(raw) }
  } catch {
    return defaultBranding
  }
}

const branding = ref<BrandingSettings>(carregarBranding())

export function useBrandingStore() {
  const salvarBranding = (dados: Partial<BrandingSettings>) => {
    branding.value = { ...branding.value, ...dados }
    persistLocal(branding.value)
  }

  const carregarBrandingPublico = async () => {
    try {
      const tenantId = resolveTenantHint()
      const response = await fetch(`${getApiBaseUrl()}/configuracoes/public/branding`, {
        headers: {
          ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
        },
        cache: 'no-store',
      })
      if (!response.ok) return

      const payload = await response.json().catch(() => ({}))
      const serverBranding = payload?.valor && typeof payload.valor === 'object' ? payload.valor : {}
      branding.value = { ...defaultBranding, ...serverBranding }
      persistLocal(branding.value)
    } catch {
      // Keep local fallback
    }
  }

  const salvarBrandingRemoto = async (token: string, tenantId?: string) => {
    const scopedTenant = tenantId || resolveTenantHint() || ''
    const response = await fetch(`${getApiBaseUrl()}/configuracoes/branding_settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(scopedTenant ? { 'x-tenant-id': scopedTenant } : {}),
      },
      body: JSON.stringify({ valor: JSON.stringify(branding.value) }),
    })

    if (!response.ok) {
      throw new Error('Nao foi possivel salvar o branding do tenant.')
    }
  }

  return {
    branding,
    salvarBranding,
    carregarBrandingPublico,
    salvarBrandingRemoto,
  }
}
