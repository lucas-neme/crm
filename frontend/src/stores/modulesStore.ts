import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getApiBaseUrl } from '../utils/apiBase'
import { useAuthStore } from './authStore'

export type ProdutoModulo = 'PADRAO' | 'IMOBILIARIA'

export interface EnabledModules {
    leads: boolean
    produtos: boolean
    imoveis: boolean
    reservas: boolean
    negocios: boolean
    contasPagar: boolean
    contasReceber: boolean
}

const defaultEnabledModules = (): EnabledModules => ({
    leads: true,
    produtos: true,
    imoveis: true,
    reservas: true,
    negocios: true,
    contasPagar: true,
    contasReceber: true,
})

export const useModulesStore = defineStore('modules', () => {
    const produtoModulo = ref<ProdutoModulo>('PADRAO')
    const enabledModules = ref<EnabledModules>(defaultEnabledModules())
    const loading = ref(false)
    const loaded = ref(false)

    const getApiUrl = () => getApiBaseUrl()

    const getAuthHeaders = () => {
        const authStore = useAuthStore()
        return {
            'Content-Type': 'application/json',
            ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
            ...(authStore.user?.tenantId ? { 'x-tenant-id': authStore.user.tenantId } : {}),
        }
    }

    const normalizeValue = (raw: any): ProdutoModulo => {
        const value = String(typeof raw === 'string' ? raw : raw?.valor || '')
            .trim()
            .toUpperCase()
        return value === 'IMOBILIARIA' ? 'IMOBILIARIA' : 'PADRAO'
    }

    const parseResponse = async (response: Response) => {
        const text = await response.text()
        if (!text) return null
        try {
            return JSON.parse(text)
        } catch {
            return text
        }
    }

    const normalizeEnabledModules = (raw: any): EnabledModules => {
        const base = defaultEnabledModules()
        let input: any = raw

        if (typeof input === 'string') {
            try {
                input = JSON.parse(input)
            } catch {
                return base
            }
        }

        if (input && typeof input === 'object' && typeof input.valor === 'string') {
            try {
                input = JSON.parse(input.valor)
            } catch {
                return base
            }
        }

        if (!input || typeof input !== 'object') return base

        return {
            leads: input.leads !== false,
            produtos: input.produtos !== false,
            imoveis: input.imoveis !== false,
            reservas: input.reservas !== false,
            negocios: input.negocios !== false,
            contasPagar: input.contasPagar !== false,
            contasReceber: input.contasReceber !== false,
        }
    }

    const fetchConfig = async (): Promise<ProdutoModulo> => {
        loading.value = true
        try {
            const [produtoRes, modulesRes] = await Promise.all([
                fetch(`${getApiUrl()}/configuracoes/produto_modulo`, {
                    cache: 'no-store',
                    headers: getAuthHeaders(),
                }),
                fetch(`${getApiUrl()}/configuracoes/enabled_modules`, {
                    cache: 'no-store',
                    headers: getAuthHeaders(),
                }),
            ])

            if (produtoRes.ok) {
                const data = await parseResponse(produtoRes)
                produtoModulo.value = normalizeValue(data)
            }

            if (modulesRes.ok) {
                const data = await parseResponse(modulesRes)
                enabledModules.value = normalizeEnabledModules(data)
            } else {
                enabledModules.value = defaultEnabledModules()
            }

            loaded.value = true
        } catch (error) {
            console.error('Failed to fetch module config', error)
        } finally {
            loading.value = false
        }
        return produtoModulo.value
    }

    const setProdutoModulo = async (modulo: string): Promise<ProdutoModulo> => {
        try {
            loading.value = true
            const normalizedToSave = normalizeValue(modulo)
            const response = await fetch(`${getApiUrl()}/configuracoes/produto_modulo`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ valor: normalizedToSave })
            })
            if (response.ok) {
                const data = await parseResponse(response)
                produtoModulo.value = normalizeValue(data)
            } else {
                throw new Error('Nao foi possivel salvar o tipo de CRM.')
            }
        } catch (error) {
            console.error('Failed to update module config', error)
            throw error
        } finally {
            loading.value = false
        }
        return produtoModulo.value
    }

    const setEnabledModules = async (modules: EnabledModules): Promise<EnabledModules> => {
        const normalized = normalizeEnabledModules(modules)
        try {
            loading.value = true
            const response = await fetch(`${getApiUrl()}/configuracoes/enabled_modules`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ valor: JSON.stringify(normalized) })
            })

            if (!response.ok) {
                throw new Error('Nao foi possivel salvar os modulos habilitados.')
            }

            enabledModules.value = normalized
        } finally {
            loading.value = false
        }

        return enabledModules.value
    }

    return {
        produtoModulo,
        enabledModules,
        loading,
        loaded,
        fetchConfig,
        setProdutoModulo,
        setEnabledModules,
    }
})
