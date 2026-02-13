import { api } from './api'
import type { Cliente } from '../stores/clientesStore'

export interface CreateClienteDto {
  nome: string
  email: string
  telefone: string
}

export const clientesService = {
  async buscarTodos() {
    return api.get<Cliente[]>('/clientes')
  },

  async buscarPorId(id: string) {
    return api.get<Cliente>(`/clientes/${id}`)
  },

  async criar(data: CreateClienteDto) {
    return api.post<Cliente>('/clientes', data)
  },

  async atualizar(id: string, data: Partial<CreateClienteDto>) {
    return api.put<Cliente>(`/clientes/${id}`, data)
  },

  async deletar(id: string) {
    return api.delete(`/clientes/${id}`)
  },

  async buscarEnderecos(clienteId: string) {
    return api.get<any>(`/clientes/${clienteId}/enderecos`)
  },

  async criarEndereco(clienteId: string, endereco: any) {
    return api.post<any>(`/clientes/${clienteId}/enderecos`, endereco)
  },

  async atualizarEndereco(clienteId: string, enderecoId: string, endereco: any) {
    return api.put<any>(`/clientes/${clienteId}/enderecos/${enderecoId}`, endereco)
  },

  async removerEndereco(clienteId: string, enderecoId: string) {
    return api.delete(`/clientes/${clienteId}/enderecos/${enderecoId}`)
  },
}
