import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getApiBaseUrl } from '../utils/apiBase'

export interface Conta {
  id: string
  descricao: string
  valor: number | string
  dtVencimento: string
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO'
  dtPagamento?: string
  dtRecebimento?: string
  clienteId?: string
  cliente?: { id: string; nome: string; email: string; telefone: string }
}

export const useFinanceiroStore = defineStore('financeiro', () => {
  const contasPagar = ref<Conta[]>([])
  const contasReceber = ref<Conta[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const getApiUrl = () => getApiBaseUrl()
  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth') as string).token : null
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    }
  }

  const toFriendlyMessage = (err: any, fallback: string) => {
    const raw = String(err?.message || '').toLowerCase()
    if (raw.includes('failed to fetch') || raw.includes('networkerror') || raw.includes('erro de conexão')) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
    }
    return err?.message || fallback
  }

  async function fetchContasPagar() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${getApiUrl()}/financeiro/pagar`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        contasPagar.value = await response.json()
      } else {
        if (response.status === 401) {
          error.value = 'Sua sessão expirou. Faça login novamente.'
        } else {
          const err = await response.json().catch(() => ({}))
          error.value = err.message || `Não foi possível carregar as contas a pagar (código ${response.status}).`
        }
      }
    } catch (e: any) {
      console.error(e)
      error.value = toFriendlyMessage(e, 'Não foi possível carregar as contas a pagar.')
    } finally {
      loading.value = false
    }
  }

  async function createContaPagar(conta: Partial<Conta>) {
    try {
      const response = await fetch(`${getApiUrl()}/financeiro/pagar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(conta),
      })
      if (response.ok) {
        await fetchContasPagar()
        return { success: true }
      }
      const errorData = await response.json().catch(() => ({}))
      return { success: false, message: errorData.message || 'Não foi possível criar a conta a pagar.' }
    } catch (e: any) {
      console.error(e)
      return { success: false, message: toFriendlyMessage(e, 'Não foi possível criar a conta a pagar.') }
    }
  }

  async function payConta(id: string) {
    try {
      const response = await fetch(`${getApiUrl()}/financeiro/pagar/${id}/pay`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        await fetchContasPagar()
        return true
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }

  async function fetchContasReceber() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${getApiUrl()}/financeiro/receber`, {
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        contasReceber.value = await response.json()
      } else {
        if (response.status === 401) {
          error.value = 'Sua sessão expirou. Faça login novamente.'
        } else {
          const err = await response.json().catch(() => ({}))
          error.value = err.message || `Não foi possível carregar as contas a receber (código ${response.status}).`
        }
      }
    } catch (e: any) {
      console.error(e)
      error.value = toFriendlyMessage(e, 'Não foi possível carregar as contas a receber.')
    } finally {
      loading.value = false
    }
  }

  async function createContaReceber(conta: Partial<Conta>) {
    try {
      const response = await fetch(`${getApiUrl()}/financeiro/receber`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(conta),
      })
      if (response.ok) {
        await fetchContasReceber()
        return { success: true }
      }
      const errorData = await response.json().catch(() => ({}))
      return { success: false, message: errorData.message || 'Não foi possível criar a conta a receber.' }
    } catch (e: any) {
      console.error(e)
      return { success: false, message: toFriendlyMessage(e, 'Não foi possível criar a conta a receber.') }
    }
  }

  async function receiveConta(id: string) {
    try {
      const response = await fetch(`${getApiUrl()}/financeiro/receber/${id}/receive`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      })
      if (response.ok) {
        await fetchContasReceber()
        return true
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }

  async function updateContaReceber(id: string, conta: Partial<Conta>) {
    try {
      const response = await fetch(`${getApiUrl()}/financeiro/receber/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(conta),
      })
      if (response.ok) {
        await fetchContasReceber()
        return { success: true }
      }
      const errorData = await response.json().catch(() => ({}))
      return { success: false, message: errorData.message || 'Não foi possível atualizar a conta a receber.' }
    } catch (e: any) {
      console.error(e)
      return { success: false, message: toFriendlyMessage(e, 'Não foi possível atualizar a conta a receber.') }
    }
  }

  async function notifyConta(id: string) {
    try {
      const response = await fetch(`${getApiUrl()}/financeiro/receber/${id}/notify`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      return response.ok
    } catch (e) {
      console.error(e)
      return false
    }
  }

  return {
    contasPagar,
    contasReceber,
    loading,
    error,
    fetchContasPagar,
    createContaPagar,
    payConta,
    fetchContasReceber,
    createContaReceber,
    updateContaReceber,
    receiveConta,
    notifyConta,
  }
})
