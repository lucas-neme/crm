import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getApiBaseUrl } from '../utils/apiBase'

interface User {
    id?: string;
    email: string;
    name?: string;
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const token = ref<string | null>(null)
    // const router = useRouter()

    const isAuthenticated = computed(() => !!token.value)

    function setToken(newToken: string) {
        token.value = newToken
    }

    function setUser(newUser: User) {
        user.value = newUser
    }

    async function login(email: string, password: string): Promise<boolean> {
        try {
            const apiUrl = getApiBaseUrl()
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json().catch(() => ({}))
            if (!response.ok) {
                const message = data?.message || 'Falha no login'
                throw new Error(message)
            }
            if (data.access_token) {
                token.value = data.access_token
                user.value = data.user || { email } // Fallback if user not in response
                return true
            }
            return false
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    async function register(name: string, email: string, password: string): Promise<string> {
        const apiUrl = getApiBaseUrl()
        const response = await fetch(`${apiUrl}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
            throw new Error(data?.message || 'Nao foi possivel registrar usuario')
        }
        return data?.message || 'Cadastro enviado com sucesso'
    }

    async function forgotPassword(email: string): Promise<string> {
        const apiUrl = getApiBaseUrl()
        const response = await fetch(`${apiUrl}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
            throw new Error(data?.message || 'Nao foi possivel enviar email de recuperacao')
        }
        return data?.message || 'Se o email existir, enviaremos o link de recuperacao'
    }

    async function resetPassword(tokenValue: string, password: string): Promise<string> {
        const apiUrl = getApiBaseUrl()
        const response = await fetch(`${apiUrl}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: tokenValue, password }),
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
            throw new Error(data?.message || 'Nao foi possivel redefinir senha')
        }
        return data?.message || 'Senha redefinida com sucesso'
    }

    function logout() {
        user.value = null
        token.value = null
    }

    return {
        user,
        token,
        isAuthenticated,
        setToken,
        setUser,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout
    }
}, {
    persist: true
})
