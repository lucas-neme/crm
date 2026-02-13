import { api } from './api'
import type { Produto } from '../stores/produtosStore'

export interface CreateProdutoDto {
  nome: string
  descricao?: string
  quantidade: number
  valorUnitario: number
}

export const produtosService = {
  async buscarTodos() {
    return api.get<Produto[]>('/produtos')
  },

  async buscarPorId(id: string) {
    return api.get<Produto>(`/produtos/${id}`)
  },

  async criar(data: CreateProdutoDto) {
    return api.post<Produto>('/produtos', data)
  },

  async atualizar(id: string, data: Partial<CreateProdutoDto>) {
    return api.put<Produto>(`/produtos/${id}`, data)
  },

  async deletar(id: string) {
    return api.delete(`/produtos/${id}`)
  },
}
