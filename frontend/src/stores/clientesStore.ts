import { ref } from 'vue'
import { clientesService } from '../services/clientesService'
import { PessoaTipoEnum } from '../types/enums/pessoa-tipo.enum'

export interface Cliente {
  id: string
  codigo?: number
  nome: string
  email: string
  telefone: string
  tipoPessoa: PessoaTipoEnum
  isAtivo?: boolean
  dtNascimento?: string
  documento?: string
  tipoCliente?: string
  observacoes?: string
  chatId?: string
  origem?: string
  interesse?: string
  pipelineStage?: string
  temperatura?: string
  dataUltimaInteracao?: string
}

const clientes = ref<Cliente[]>([])
const carregando = ref(false)

export function useClientesStore() {
  const carregarClientes = async () => {
    try {
      carregando.value = true
      const response = await clientesService.buscarTodos() as any
      clientes.value = response.data || response
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      carregando.value = false
    }
  }

  const adicionarCliente = async (novoCliente: Omit<Cliente, 'id'>) => {
    try {
      const clienteCriado = await clientesService.criar(novoCliente)
      await carregarClientes()
      return clienteCriado
    } catch (error) {
      console.error('Erro ao criar cliente:', error)
      throw error
    }
  }

  const deletarCliente = async (id: string) => {
    try {
      await clientesService.deletar(id)
      clientes.value = clientes.value.filter(c => c.id !== id)
    } catch (error) {
      console.error('Erro ao deletar cliente:', error)
      throw error
    }
  }

  const obterCliente = (id: string) => {
    return clientes.value.find(c => c.id === id)
  }

  const carregarClientePorId = async (id: string) => {
    try {
      const response = await clientesService.buscarPorId(id) as any
      const cliente = response.data || response
      const index = clientes.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clientes.value[index] = cliente as Cliente
      } else {
        clientes.value.push(cliente as Cliente)
      }
      return cliente as Cliente
    } catch (error) {
      console.error('Erro ao carregar cliente por ID:', error)
      throw error
    }
  }

  const atualizarCliente = async (id: string, dadosAtualizados: Partial<Cliente>) => {
    try {
      await clientesService.atualizar(id, dadosAtualizados as any)
      const index = clientes.value.findIndex(c => c.id === id)
      if (index !== -1) {
        clientes.value[index] = { ...clientes.value[index], ...dadosAtualizados } as Cliente
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      throw error
    }
  }

  const carregarEnderecos = async (clienteId: string) => {
    try {
      const response = await clientesService.buscarEnderecos(clienteId)
      return response.data || []
    } catch (error) {
      console.error('Erro ao carregar endereços:', error)
      return []
    }
  }

  const adicionarEndereco = async (clienteId: string, endereco: any) => {
    try {
      const response = await clientesService.criarEndereco(clienteId, endereco)
      return response.data
    } catch (error) {
      console.error('Erro ao adicionar endereço:', error)
      throw error
    }
  }

  const atualizarEndereco = async (clienteId: string, addrId: string, endereco: any) => {
    try {
      const response = await clientesService.atualizarEndereco(clienteId, addrId, endereco)
      return response.data
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error)
      throw error
    }
  }

  const removerEndereco = async (clienteId: string, addrId: string) => {
    try {
      await clientesService.removerEndereco(clienteId, addrId)
      return true
    } catch (error) {
      console.error('Erro ao remover endereço:', error)
      return false
    }
  }

  const buscarCEP = async (cep: string) => {
    try {
      const cleanCep = cep.replace(/\D/g, '')
      if (cleanCep.length !== 8) return null
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      if (response.ok) {
        const data = await response.json()
        if (data.erro) return null
        return {
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf
        }
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      return null
    }
  }

  const carregarEstados = async () => {
    try {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      if (response.ok) {
        return await response.json()
      }
      return []
    } catch (error) {
      console.error('Erro ao carregar estados:', error)
      return []
    }
  }

  const carregarCidades = async (uf: string) => {
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
      if (response.ok) {
        return await response.json()
      }
      return []
    } catch (error) {
      console.error('Erro ao carregar cidades:', error)
      return []
    }
  }

  return {
    clientes,
    carregando,
    carregarClientes,
    adicionarCliente,
    deletarCliente,
    obterCliente,
    carregarClientePorId,
    atualizarCliente,
    carregarEnderecos,
    adicionarEndereco,
    atualizarEndereco,
    removerEndereco,
    buscarCEP,
    carregarEstados,
    carregarCidades
  }
}
