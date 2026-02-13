import { defineStore } from 'pinia'
import { ref } from 'vue'

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
  isActive: boolean
  approved: boolean
  createdAt?: string
  updatedAt?: string
  permissions: UserPermissions
}

const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000'

const getAuthHeaders = () => {
  const authRaw = localStorage.getItem('auth')
  const token = authRaw ? JSON.parse(authRaw).token : null
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
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
    await fetch(`${getApiUrl()}/auth/users/${userId}/permissions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ permissions }),
    })
    await fetchUsers()
  }

  return {
    users,
    loading,
    fetchUsers,
    approveUser,
    revokeUser,
    savePermissions,
  }
})
