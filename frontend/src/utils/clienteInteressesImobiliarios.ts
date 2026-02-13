const PREFIX = 'IMOVEIS_IDS:'

export const serializeInteressesEmpreendimentos = (ids: string[]): string => {
  const normalized = ids.map((id) => id.trim()).filter(Boolean)
  if (!normalized.length) return ''
  return `${PREFIX}${normalized.join(',')}`
}

export const parseInteressesEmpreendimentos = (value?: string | null): string[] => {
  if (!value) return []
  const raw = value.trim()
  if (!raw.startsWith(PREFIX)) return []
  return raw
    .slice(PREFIX.length)
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
}

export const isInteresseImobiliarioSerializado = (value?: string | null): boolean => {
  return Boolean(value && value.trim().startsWith(PREFIX))
}
