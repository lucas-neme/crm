import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getApiBaseUrl } from '../utils/apiBase'

export const useModulesStore = defineStore('modules', () => {
    const produtoModulo = ref<string>('PADRAO') // PADRAO | IMOBILIARIA
    const loading = ref(false)

    const getApiUrl = () => getApiBaseUrl()
    const normalizeValue = (raw: any): 'PADRAO' | 'IMOBILIARIA' => {
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

    const fetchConfig = async (): Promise<'PADRAO' | 'IMOBILIARIA'> => {
        loading.value = true
        try {
            const response = await fetch(`${getApiUrl()}/configuracoes/produto_modulo`, {
                cache: 'no-store'
            })
            if (response.ok) {
                const data = await parseResponse(response)
                produtoModulo.value = normalizeValue(data)
            }
        } catch (error) {
            console.error('Failed to fetch module config', error)
        } finally {
            loading.value = false
        }
        return produtoModulo.value as 'PADRAO' | 'IMOBILIARIA'
    }

    const setProdutoModulo = async (modulo: string): Promise<'PADRAO' | 'IMOBILIARIA'> => {
        try {
            loading.value = true
            const normalizedToSave = normalizeValue(modulo)
            const response = await fetch(`${getApiUrl()}/configuracoes/produto_modulo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valor: normalizedToSave })
            })
            if (response.ok) {
                const data = await parseResponse(response)
                produtoModulo.value = normalizeValue(data)
            } else {
                throw new Error('Não foi possível salvar o tipo de CRM.')
            }
        } catch (error) {
            console.error('Failed to update module config', error)
            throw error
        } finally {
            loading.value = false
        }
        return produtoModulo.value as 'PADRAO' | 'IMOBILIARIA'
    }

    return {
        produtoModulo,
        loading,
        fetchConfig,
        setProdutoModulo
    }
})
