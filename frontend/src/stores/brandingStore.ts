import { ref } from 'vue'

export interface BrandingSettings {
  nomeCRM: string
  logoUrl: string
  logoScale: number
  logoOffsetX: number
  logoOffsetY: number
  slogan: string
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
  logoScale: 100,
  logoOffsetX: 0,
  logoOffsetY: 0,
  slogan: '',
  email: '',
  telefone: '',
  endereco: '',
  website: '',
  cnpj: '',
}

const carregarBranding = (): BrandingSettings => {
  if (typeof window === 'undefined') return defaultBranding
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultBranding
    return { ...defaultBranding, ...JSON.parse(raw) }
  } catch (error) {
    console.error('Erro ao carregar branding:', error)
    return defaultBranding
  }
}

const branding = ref<BrandingSettings>(carregarBranding())

export function useBrandingStore() {
  const salvarBranding = (dados: Partial<BrandingSettings>) => {
    branding.value = { ...branding.value, ...dados }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(branding.value))
    }
  }

  return {
    branding,
    salvarBranding,
  }
}
