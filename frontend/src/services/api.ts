import { useAuthStore } from '../stores/authStore'
import { notificationsStore } from '../stores/notificationsStore'
import { getApiBaseUrl } from '../utils/apiBase'

const API_URL = getApiBaseUrl()

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const authStore = useAuthStore()
  let response: Response
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options?.headers as Record<string, string>) || {}),
    }

    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }

    if (authStore.user?.tenantId) {
      headers['x-tenant-id'] = authStore.user.tenantId
    }

    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.')
  }

  if (!response.ok) {
    if (response.status === 401) {
      if (authStore.token) {
        authStore.logout()
        window.location.href = '/login'
      }
    }

    let errorMessage = `Não foi possível concluir a operação (código ${response.status}).`
    try {
      const errorBody = await response.json()
      if (errorBody.message) {
        errorMessage = Array.isArray(errorBody.message)
          ? errorBody.message.join(', ')
          : errorBody.message
      }
    } catch {
      // Keep the fallback message.
    }
    
    if (response.status !== 401) {
      notificationsStore.notify(errorMessage, 'error')
    }
    
    throw new Error(errorMessage)
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}
