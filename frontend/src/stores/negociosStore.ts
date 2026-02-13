import { ref } from 'vue'
import { negociosService } from '../services/negociosService'

export interface NegocioProduto {
  produtoId: string
  produtoNome?: string
  quantidade: number
  valorUnitario: number
  desconto?: number
}

export interface Negocio {
  id: string
  codigo?: number;
  clienteId: string;
  cliente?: { id: string; nome: string };
  entrega: boolean;
  dataEntrega?: string | Date;
  dataVenda: string;
  valorFinal: number | string,
  descontoGeral?: number;
  produtos?: NegocioProduto[]
}

const negocios = ref<Negocio[]>([])
const carregando = ref(false)

export function useNegociosStore() {
  const carregarNegocios = async () => {
    try {
      carregando.value = true
      const response = await negociosService.buscarTodos() as any
      negocios.value = response.data || response
    } catch (error) {
      console.error('Erro ao carregar negócios:', error)
    } finally {
      carregando.value = false
    }
  }

  const carregarNegocioPorId = async (id: string) => {
    try {
      carregando.value = true
      const response = await negociosService.buscarPorId(id) as any
      const negocio = response.data || response
      const index = negocios.value.findIndex(n => n.id === id)
      if (index !== -1) {
        negocios.value[index] = negocio as Negocio
      } else {
        negocios.value.push(negocio as Negocio)
      }
      return negocio as Negocio
    } catch (error) {
      console.error('Erro ao carregar negócio:', error)
      throw error
    } finally {
      carregando.value = false
    }
  }

  const adicionarNegocio = async (novoNegocio: Omit<Negocio, 'id' | 'valorFinal'>) => {
    try {
      const negocioCriado = await negociosService.criar(novoNegocio as any)
      await carregarNegocios()
      return negocioCriado
    } catch (error) {
      console.error('Erro ao criar negócio:', error)
      throw error
    }
  }

  const deletarNegocio = async (id: string) => {
    try {
      await negociosService.deletar(id)
      negocios.value = negocios.value.filter(n => n.id !== id)
    } catch (error) {
      console.error('Erro ao deletar negócio:', error)
      throw error
    }
  }

  const obterNegocio = (id: string) => {
    return negocios.value.find(n => n.id === id)
  }

  const atualizarNegocio = async (id: string, dadosAtualizados: Partial<Negocio>) => {
    try {
      await negociosService.atualizar(id, dadosAtualizados as any)
      const index = negocios.value.findIndex(n => n.id === id)
      if (index !== -1) {
        negocios.value[index] = { ...negocios.value[index], ...dadosAtualizados } as Negocio
      }
    } catch (error) {
      console.error('Erro ao atualizar negócio:', error)
      throw error
    }
  }

  return {
    negocios,
    carregando,
    carregarNegocios,
    carregarNegocioPorId,
    adicionarNegocio,
    deletarNegocio,
    obterNegocio,
    atualizarNegocio,
  }
}
