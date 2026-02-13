import { defineStore } from 'pinia'
import { ref } from 'vue'

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

    const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000'

    async function fetchReservas() {
        loading.value = true
        try {
            const res = await fetch(`${getApiUrl()}/reservas`)
            if (res.ok) reservas.value = await res.json()
        } finally {
            loading.value = false
        }
    }

    async function createReserva(data: any) {
        loading.value = true
        try {
            const res = await fetch(`${getApiUrl()}/reservas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await res.json()
            if (res.ok) {
                await fetchReservas()
                return { success: true }
            }
            return { success: false, message: result.message || 'Erro ao criar reserva' }
        } catch (e: any) {
            return { success: false, message: e.message }
        } finally {
            loading.value = false
        }
    }

    async function cancelReserva(id: string) {
        try {
            const res = await fetch(`${getApiUrl()}/reservas/${id}/cancel`, { method: 'POST' })
            if (res.ok) await fetchReservas()
        } catch (e) {
            console.error(e)
        }
    }

    async function updateReserva(id: string, data: any) {
        loading.value = true
        try {
            const res = await fetch(`${getApiUrl()}/reservas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                await fetchReservas()
                return { success: true }
            }
            const err = await res.json().catch(() => ({}))
            return { success: false, message: err.message || 'Não foi possível atualizar a reserva.' }
        } catch (e: any) {
            return { success: false, message: e?.message || 'Não foi possível atualizar a reserva.' }
        } finally {
            loading.value = false
        }
    }

    async function fetchPropostas() {
        loading.value = true
        try {
            const res = await fetch(`${getApiUrl()}/propostas`)
            if (res.ok) propostas.value = await res.json()
        } finally {
            loading.value = false
        }
    }

    async function createProposta(data: any) {
        loading.value = true
        try {
            const res = await fetch(`${getApiUrl()}/propostas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (res.ok) {
                await fetchPropostas()
                return { success: true }
            }
            return { success: false }
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
