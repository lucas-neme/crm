import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export interface Empreendimento {
    id: string;
    nome: string;
    status: 'LANÇAMENTO' | 'EM OBRAS' | 'PRONTO' | 'ESGOTADO';
    previsaoEntrega?: string;
    descricaoCurta?: string;
    enderecoCep?: string;
    enderecoLogradouro?: string;
    enderecoNumero?: string;
    enderecoBairro?: string;
    enderecoCidade?: string;
    enderecoUf?: string;
    unidades?: Unidade[];
}

export interface Unidade {
    id: string;
    empreendimentoId: string;
    codigoInterno: string;
    tipo: string;
    tipologia: string;
    statusUnidade: string;
    valorTabela: number;
    valorOferta: number;
    areaPrivativa: number;
    quartos: number;
    vagas: number;
}

export const useImoveisStore = defineStore('imoveis', () => {
    const empreendimentos = ref<Empreendimento[]>([])
    const currentEmpreendimento = ref<Empreendimento | null>(null)
    const unidades = ref<Unidade[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    async function fetchEmpreendimentos() {
        loading.value = true
        try {
            const data = await api.get<Empreendimento[]>('/empreendimentos')
            empreendimentos.value = data
        } catch (e: any) {
            error.value = e.message
        } finally {
            loading.value = false
        }
    }

    async function fetchEmpreendimento(id: string) {
        loading.value = true
        try {
            const data = await api.get<Empreendimento>(`/empreendimentos/${id}`)
            currentEmpreendimento.value = data
        } catch (e: any) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    async function fetchUnidades(empreendimentoId: string) {
        loading.value = true
        try {
            const data = await api.get<Unidade[]>(`/unidades?empreendimentoId=${empreendimentoId}`)
            unidades.value = data
        } catch (e: any) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    async function createEmpreendimento(data: any) {
        loading.value = true
        try {
            await api.post('/empreendimentos', data)
            await fetchEmpreendimentos()
            return { success: true }
        } catch (e: any) {
            return { success: false, message: e.message }
        } finally {
            loading.value = false
        }
    }

    async function updateEmpreendimento(id: string, data: any) {
        loading.value = true
        try {
            await api.put(`/empreendimentos/${id}`, data)
            if (currentEmpreendimento.value && currentEmpreendimento.value.id === id) {
                await fetchEmpreendimento(id)
            }
            return { success: true }
        } catch (e: any) {
            return { success: false, message: e.message }
        } finally {
            loading.value = false
        }
    }

    async function deleteEmpreendimento(id: string) {
        if (!confirm('Excluir este empreendimento e todas as suas unidades?')) return

        loading.value = true
        try {
            await api.delete(`/empreendimentos/${id}`)
            empreendimentos.value = empreendimentos.value.filter(e => e.id !== id)
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    async function createUnidade(data: any) {
        loading.value = true
        try {
            await api.post('/unidades', data)
            if (currentEmpreendimento.value) {
                await fetchUnidades(currentEmpreendimento.value.id)
            }
            return { success: true }
        } catch (e: any) {
            return { success: false, message: e.message || 'Erro ao criar unidade' }
        } finally {
            loading.value = false
        }
    }

    async function updateUnidade(id: string, data: any) {
        loading.value = true
        try {
            await api.put(`/unidades/${id}`, data)
            if (currentEmpreendimento.value) {
                await fetchUnidades(currentEmpreendimento.value.id)
            }
            return { success: true }
        } catch (e: any) {
            return { success: false, message: e.message || 'Erro ao atualizar unidade' }
        } finally {
            loading.value = false
        }
    }

    async function updateUnidadeStatus(id: string, status: string) {
        try {
            await api.put(`/unidades/${id}`, { statusUnidade: status })
            if (currentEmpreendimento.value) {
                fetchUnidades(currentEmpreendimento.value.id)
            }
        } catch (e) { console.error(e) }
    }

    return {
        empreendimentos,
        currentEmpreendimento,
        unidades,
        loading,
        error,
        fetchEmpreendimentos,
        fetchEmpreendimento,
        createEmpreendimento,
        updateEmpreendimento,
        deleteEmpreendimento,
        fetchUnidades,
        createUnidade,
        updateUnidade,
        updateUnidadeStatus
    }
})
