import { api } from './api'
import type { Negocio } from '../stores/negociosStore'

export interface CreateNegocioProdutoDto {
  produtoId: string
  quantidade: number
  valorUnitario: number
  desconto?: number
}

export interface CreateNegocioDto {
  clienteId: string;
  dataVenda: string;
  entrega: boolean,
  dataEntrega?: string;
  descontoGeral?: number;
  produtos: CreateNegocioProdutoDto[]
}

export const negociosService = {
  async buscarTodos() {
    return api.get<Negocio[]>('/negocios')
  },

  async buscarPorId(id: string) {
    return api.get<Negocio>(`/negocios/${id}`)
  },

  async criar(data: CreateNegocioDto) {
    return api.post<Negocio>('/negocios', data)
  },

  async atualizar(id: string, data: Partial<CreateNegocioDto>) {
    return api.put<Negocio>(`/negocios/${id}`, data)
  },

  async deletar(id: string) {
    return api.delete(`/negocios/${id}`)
  },
}
