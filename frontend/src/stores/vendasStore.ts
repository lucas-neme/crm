import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export interface Reserva {
    id: string;
    unidadeId: string;
    clienteId: string;
    dataInicio: string;
    dataFim: string;
    status: 'ATIVA' | 'VENCIDA' | 'CANCELADA' | 'CONVERTIDA' | 'EXPIRADA';
    observacoes?: string;
    unidade?: any;
    cliente?: any;
}

export interface Proposta {
    id: string;
    unidadeId: string;
    clienteId: string;
    valorProposto: number;
    condicoesPagamento: string;
    status: 'ENVIADA' | 'EM_ANALISE' | 'ACEITA' | 'RECUSADA';
    unidade?: any;
    cliente?: any;
}

export const useVendasStore = defineStore('vendas', () => {
    const reservas = ref<Reserva[]>([])
    const propostas = ref<Proposta[]>([])
    const loading = ref(false)

    async function fetchReservas() {
        loading.value = true
        try {
            reservas.value = await api.get<Reserva[]>('/reservas')
        } catch (e: any) {
            console.error('Erro ao carregar reservas:', e)
        } finally {
            loading.value = false
        }
    }

    async function createReserva(data: any) {
        loading.value = true
        try {
            await api.post('/reservas', data)
            await fetchReservas()
            return { success: true }
        } catch (e: any) {
            return { success: false, message: e.message || 'Erro ao criar reserva' }
        } finally {
            loading.value = false
        }
    }

    async function cancelReserva(id: string) {
        try {
            await api.post(`/reservas/${id}/cancel`, {})
            await fetchReservas()
        } catch (e) {
            console.error('Erro ao cancelar reserva:', e)
        }
    }

    async function updateReserva(id: string, data: any) {
        loading.value = true
        try {
            await api.put(`/reservas/${id}`, data)
            await fetchReservas()
            return { success: true }
        } catch (e: any) {
            return { success: false, message: e?.message || 'Não foi possível atualizar a reserva.' }
        } finally {
            loading.value = false
        }
    }

    async function fetchPropostas() {
        loading.value = true
        try {
            propostas.value = await api.get<Proposta[]>('/propostas')
        } catch (e) {
            console.error('Erro ao carregar propostas:', e)
        } finally {
            loading.value = false
        }
    }

    async function createProposta(data: any) {
        loading.value = true
        try {
            await api.post('/propostas', data)
            await fetchPropostas()
            return { success: true }
        } catch (e: any) {
            return { success: false, message: e.message || 'Erro ao criar proposta' }
        } finally {
            loading.value = false
        }
    }

    return {
        reservas,
        propostas,
        loading,
        fetchReservas,
        createReserva,
        cancelReserva,
        updateReserva,
        fetchPropostas,
        createProposta
    }
})
