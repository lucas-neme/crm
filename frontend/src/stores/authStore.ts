import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            if (!response.ok) {
                console.error('Login failed:', response.statusText)
                return false
            }

            const data = await response.json()
            if (data.access_token) {
                token.value = data.access_token
                user.value = data.user || { email } // Fallback if user not in response
                return true
            }
            return false
        } catch (error) {
            console.error('Login error:', error)
            return false
        }
    }

    function logout() {
        user.value = null
        token.value = null
    }

    return { user, token, isAuthenticated, setToken, setUser, login, logout }
}, {
    persist: true
})
