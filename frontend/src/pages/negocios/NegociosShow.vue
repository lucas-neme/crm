<template>
  <v-container fluid class="page">
    <div class="page-header">
      <v-btn variant="tonal" to="/negocios">← Voltar</v-btn>
      <div class="page-actions">
        <v-btn color="primary" variant="tonal" :to="`/negocios/${negocioId}/editar`">Editar</v-btn>
        <v-btn color="error" variant="tonal" @click="abrirConfirmacaoExcluir">Excluir</v-btn>
      </div>
    </div>

    <v-card elevation="2" class="detail-card">
      <v-card-title>
        <div>
          <h2>Negócio de {{ negocio.cliente?.nome || 'Cliente não especificado' }}</h2>
          <p class="subtitle">Código #{{ String(negocio.codigo).padStart(3, '0') }}</p>
        </div>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="summary-card">
              <v-card-text>
                <div class="summary-label">Cliente</div>
                <div class="summary-value">{{ negocio.cliente?.nome || 'N/A' }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="summary-card">
              <v-card-text>
                <div class="summary-label">Data da Venda</div>
                <div class="summary-value">{{ negocio.dataVenda ? formatarDataVenda(negocio.dataVenda) : 'N/A' }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="summary-card">
              <v-card-text>
                <div class="summary-label">Requer Entrega</div>
                <div class="summary-value">{{ negocio.entrega ? 'Sim' : 'Não' }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="summary-card">
              <v-card-text>
                <div class="summary-label">Previsão de Entrega</div>
                <div class="summary-value">{{ negocio.dataEntrega ? formatarData(negocio.dataEntrega) : 'N/A' }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="summary-card">
              <v-card-text>
                <div class="summary-label">Valor Total</div>
                <div class="summary-value">R$ {{ Number.isFinite(Number(negocio.valorFinal)) ? Number(negocio.valorFinal).toFixed(2) : '0.00' }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <h3 class="section-title">{{ sectionTitle }}</h3>
        <v-table v-if="negocio.produtos && negocio.produtos.length > 0" class="table">
          <thead>
            <tr>
              <th>{{ itemLabel }}</th>
              <th class="text-right">Quantidade</th>
              <th class="text-right">Valor Unitário</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in negocio.produtos" :key="index">
              <td>{{ obterNomeItem(item) }}</td>
              <td class="text-right">{{ item.quantidade }}</td>
              <td class="text-right">R$ {{ Number(item.valorUnitario).toFixed(2) }}</td>
              <td class="text-right"><strong>R$ {{ (Number(item.quantidade) * Number(item.valorUnitario)).toFixed(2) }}</strong></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" class="text-right"><strong>Valor Total:</strong></td>
              <td class="text-right"><strong>R$ {{ Number.isFinite(Number(negocio.valorFinal)) ? Number(negocio.valorFinal).toFixed(2) : '0.00' }}</strong></td>
            </tr>
          </tfoot>
        </v-table>
        <div v-else class="empty-state">Sem itens</div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="confirmarExcluir" max-width="440">
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon icon="delete" color="error" />
          Confirmar exclusão
        </v-card-title>
        <v-card-text>Tem certeza que deseja excluir este negócio? Essa ação não poderá ser desfeita.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="tonal" color="grey" @click="confirmarExcluir = false">Cancelar</v-btn>
          <v-btn color="error" @click="confirmarExclusao">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNegociosStore } from '../../stores/negociosStore'
import { useProdutosStore } from '../../stores/produtosStore'
import { useModulesStore } from '../../stores/modulesStore'

const router = useRouter()
const route = useRoute()
const { obterNegocio, deletarNegocio, carregarNegocioPorId } = useNegociosStore()
const { produtos, carregarProdutos } = useProdutosStore()
const modulesStore = useModulesStore()

const negocioId = route.params.id as string
const confirmarExcluir = ref(false)
const unidades = ref<Array<{ id: string; nome: string }>>([])
const itemLabel = ref('Produto')
const sectionTitle = ref('Itens do Negócio')
const negocio = computed(() => {
  return obterNegocio(negocioId) || {
    id: negocioId,
    codigo: 0,
    clienteId: '',
    cliente: { id: '', nome: 'Negócio não encontrado' },
    entrega: false,
    dataEntrega: null,
    dataVenda: '',
    valorFinal: 0,
    produtos: [],
  }
})

const formatarData = (data: string | Date | undefined) => {
  if (!data) return 'N/A'
  const d = new Date(data)
  return d.toLocaleDateString('pt-BR')
}

const formatarDataVenda = (data: string) => {
  if (!data) return '-'
  
  // Se já vier no formato YYYY-MM-DD, converte para DD/MM/AAAA
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

const obterNomeProduto = (produtoId: string) => {
  const produto = produtos.value.find(p => p.id === produtoId)
  return produto?.nome || produtoId
}

const obterNomeUnidade = (produtoId: string) => {
  const unidade = unidades.value.find(u => u.id === produtoId)
  return unidade?.nome || produtoId
}

const obterNomeItem = (item: { produtoId: string; produtoNome?: string }) => {
  if (item.produtoNome) return item.produtoNome
  if (modulesStore.produtoModulo === 'IMOBILIARIA') return obterNomeUnidade(item.produtoId)
  return obterNomeProduto(item.produtoId)
}

onMounted(async () => {
  await modulesStore.fetchConfig()
  itemLabel.value = modulesStore.produtoModulo === 'IMOBILIARIA' ? 'Unidade' : 'Produto'
  sectionTitle.value = modulesStore.produtoModulo === 'IMOBILIARIA' ? 'Unidades do Negócio' : 'Itens do Negócio'

  if (modulesStore.produtoModulo === 'IMOBILIARIA') {
    const res = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/unidades`)
    const data = res.ok ? await res.json() : []
    unidades.value = (data || []).map((u: any) => ({
      id: u.id,
      nome: `${u.codigoInterno || u.id} - ${u.tipo || 'Unidade'}`,
    }))
    await carregarNegocioPorId(negocioId)
  } else {
    await Promise.all([
      carregarNegocioPorId(negocioId),
      carregarProdutos(),
    ])
  }
})

const abrirConfirmacaoExcluir = () => {
  confirmarExcluir.value = true
}

const confirmarExclusao = async () => {
  await deletarNegocio(negocioId)
  confirmarExcluir.value = false
  router.push('/negocios')
}
</script>

<style scoped>
.page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-actions {
  display: flex;
  gap: 0.75rem;
}

.detail-card {
  border-radius: 16px;
}

.subtitle {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.summary-card {
  border-radius: 12px;
}

.summary-label {
  font-size: 0.8rem;
  color: #6b7280;
}

.summary-value {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 1.5rem;
  color: #9ca3af;
}
</style>
