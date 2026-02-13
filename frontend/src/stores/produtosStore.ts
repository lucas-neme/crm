import { ref } from 'vue'
import { produtosService } from '../services/produtosService'

export interface Produto {
  id: string
  codigo?: number
  nome: string
  descricao?: string
  quantidade: number
  valorUnitario: number | string
  categoria?: string
  isActive?: boolean
}

const produtos = ref<Produto[]>([])
const carregando = ref(false)

export function useProdutosStore() {
  const carregarProdutos = async () => {
    try {
      carregando.value = true
      const response = await produtosService.buscarTodos() as any
      produtos.value = response.data || response
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      carregando.value = false
    }
  }

  const adicionarProduto = async (novoProduto: Omit<Produto, 'id'>) => {
    try {
      const produtoParaEnviar = {
        ...novoProduto,
        valorUnitario: Number(novoProduto.valorUnitario),
      }
      const produtoCriado = await produtosService.criar(produtoParaEnviar)
      await carregarProdutos()
      return produtoCriado
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      throw error
    }
  }

  const deletarProduto = async (id: string) => {
    try {
      await produtosService.deletar(id)
      produtos.value = produtos.value.filter(p => p.id !== id)
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
      throw error
    }
  }

  const obterProduto = (id: string) => {
    return produtos.value.find(p => p.id === id)
  }

  const atualizarProduto = async (id: string, dadosAtualizados: Partial<Produto>) => {
    try {
      const dadosParaEnviar: any = {
        ...dadosAtualizados,
      }
      if (dadosAtualizados.valorUnitario !== undefined) {
        dadosParaEnviar.valorUnitario = Number(dadosAtualizados.valorUnitario)
      }
      await produtosService.atualizar(id, dadosParaEnviar)
      const index = produtos.value.findIndex(p => p.id === id)
      if (index !== -1) {
        produtos.value[index] = { ...produtos.value[index], ...dadosAtualizados } as Produto
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      throw error
    }
  }

  return {
    produtos,
    carregando,
    carregarProdutos,
    adicionarProduto,
    deletarProduto,
    obterProduto,
    atualizarProduto,
  }
}
