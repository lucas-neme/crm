import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './authStore'
import { getApiBaseUrl } from '../utils/apiBase'

export interface UserPermissions {
  [module: string]: {
    read: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
}

export interface ManagedUser {
  id: string
  name: string
  email: string
  isSystemAdmin?: boolean
  phone?: string
  birthDate?: string
  isActive: boolean
  approved: boolean
  createdAt?: string
  updatedAt?: string
  permissions: UserPermissions
}

const getApiUrl = () => getApiBaseUrl()

const getAuthHeaders = () => {
  const authStore = useAuthStore()
  const token = authStore.token
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
    ...(authStore.user?.tenantId ? { 'x-tenant-id': authStore.user.tenantId } : {}),
  }
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<ManagedUser[]>([])
  const loading = ref(false)

  const fetchUsers = async () => {
    loading.value = true
    try {
      const response = await fetch(`${getApiUrl()}/auth/users`, {
        headers: getAuthHeaders(),
      })
      if (!response.ok) return
      users.value = await response.json()
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      loading.value = false
    }
  }

  const approveUser = async (userId: string) => {
    await fetch(`${getApiUrl()}/auth/users/${userId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    await fetchUsers()
  }

  const revokeUser = async (userId: string) => {
    await fetch(`${getApiUrl()}/auth/users/${userId}/revoke`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    await fetchUsers()
  }

  const savePermissions = async (userId: string, permissions: UserPermissions) => {
    const response = await fetch(`${getApiUrl()}/auth/users/${userId}/permissions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ permissions }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data?.message || 'Nao foi possivel salvar as permissoes')
    }

    await fetchUsers()
  }

  const updateProfile = async (
    userId: string,
    payload: { name: string; email: string; phone?: string; birthDate?: string },
  ) => {
    const response = await fetch(`${getApiUrl()}/auth/users/${userId}/profile`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data?.message || 'Nao foi possivel salvar os dados do usuario')
    }

    await fetchUsers()
  }

  const changePassword = async (userId: string, password: string) => {
    const response = await fetch(`${getApiUrl()}/auth/users/${userId}/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data?.message || 'Nao foi possivel alterar a senha')
    }
  }

  return {
    users,
    loading,
    fetchUsers,
    approveUser,
    revokeUser,
    savePermissions,
    updateProfile,
    changePassword,
  }
})
