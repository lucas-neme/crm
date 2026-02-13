/**
 * Formata um número de telefone com máscara
 * @param telefone - Número de telefone (apenas dígitos)
 * @returns Telefone formatado: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatTelefone(telefone: string | number | undefined): string {
  if (!telefone) return ''

  // Remove caracteres não numéricos
  const cleaned = String(telefone).replace(/\D/g, '')

  // Se tiver 11 dígitos (celular): (XX) XXXXX-XXXX
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  // Se tiver 10 dígitos (fixo): (XX) XXXX-XXXX
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  // Se tiver menos dígitos, retorna como está
  return cleaned
}

/**
 * Aplica máscara de telefone conforme digitação
 * Suporta 8 dígitos (fixo) e 9 dígitos (celular) + DDD
 * @param value - Valor atual do input
 * @returns Valor mascarado
 */
export function maskPhone(value: string): string {
  if (!value) return ''

  // Remove tudo que não é dígito e limita a 11 números
  const numbers = value.replace(/\D/g, '').substring(0, 11)

  if (numbers.length === 0) return ''

  // (XX
  if (numbers.length <= 2) return `(${numbers}`

  // (XX) XXXX...
  if (numbers.length <= 6) return `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`

  // (XX) XXXX-XXXX (Para fixo ou celular incompleto)
  if (numbers.length <= 10) {
    return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`
  }

  // (XX) XXXXX-XXXX (Para celular completo)
  return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`
}

/**
 * Aplica máscara de CPF
 * @param value - Valor do input
 * @returns CPF mascarado: XXX.XXX.XXX-XX
 */
export function maskCPF(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 11)
  return v.replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

/**
 * Aplica máscara de CNPJ
 * @param value - Valor do input
 * @returns CNPJ mascarado: XX.XXX.XXX/XXXX-XX
 */
export function maskCNPJ(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 14)
  return v.replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

/**
 * Aplica máscara de Passaporte
 * @param value - Valor do input
 * @returns Passaporte mascarado: AAXXXXXX
 */
export function maskPassport(value: string): string {
  let v = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  // Mantém apenas as primeiras 2 ser letras e os próximos 6 serem números

  // Se ainda está nas primeiras 2 letras
  if (v.length <= 2) {
    v = v.replace(/[^A-Z]/g, '')
  } else {
    // Garante que os caracteres após o índice 2 sejam números
    const letters = v.substring(0, 2)
    const numbers = v.substring(2).replace(/\D/g, '')
    v = (letters + numbers).substring(0, 8)
  }
  return v
}

/**
 * Função genérica de máscara de documento baseada no tipo de pessoa
 * @param value - Valor atual do input
 * @param tipoPessoa - Tipo de pessoa (FISICA, JURIDICA, ESTRANGEIRA)
 * @returns Documento formatado corretamente
 */
export function maskDocument(value: string, tipoPessoa: string): string {
  if (!value) return ''

  switch (tipoPessoa) {
    case 'FISICA':
      return maskCPF(value)
    case 'JURIDICA':
      return maskCNPJ(value)
    case 'ESTRANGEIRA':
      return maskPassport(value)
    default:
      return value
  }
}
