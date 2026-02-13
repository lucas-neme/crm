<template>
  <v-container fluid class="page">
    <div class="page-header">
      <div>
        <h2>Negócios</h2>
        <p class="subtitle">Gerencie seus negócios cadastrados</p>
      </div>
      <div class="header-actions">
        <v-text-field
          v-model="search"
          label="Pesquisar"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          variant="outlined"
          class="search-field"
        />
        <ColumnManagerMenu
          v-model="visibleColumns"
          :columns="columns"
          @reset="resetColumns"
          @select-all="selectAllColumns"
        />
        <v-btn color="primary" to="/negocios/novo" class="text-none" prepend-icon="mdi-plus">
          Novo Negócio
        </v-btn>
      </div>
    </div>

    <v-card elevation="2" class="table-card">
      <v-card-text>
      <v-skeleton-loader
        v-if="carregando"
        type="table-heading, table-row-divider@6"
        class="bg-transparent"
      ></v-skeleton-loader>

      <template v-else>
        <v-table class="table" v-if="filteredNegocios.length > 0">
          <thead>
            <tr>
              <th v-if="isColumnVisible('codigo')">Código</th>
              <th v-if="isColumnVisible('cliente')">Cliente</th>
              <th v-if="isColumnVisible('dataVenda')">Data da Venda</th>
              <th v-if="isColumnVisible('dataEntrega')">Data de Entrega</th>
              <th v-if="isColumnVisible('entrega')">Entrega</th>
              <th v-if="isColumnVisible('itens')">{{ itensHeader }}</th>
              <th v-if="isColumnVisible('descontoGeral')">Desconto</th>
              <th v-if="isColumnVisible('valorFinal')">Valor Final</th>
              <th v-if="isColumnVisible('acoes')">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="negocio in filteredNegocios"
              :key="negocio.id"
              class="clickable-row"
              role="button"
              tabindex="0"
              @click="irParaNegocio(negocio.id)"
              @keydown.enter.prevent="irParaNegocio(negocio.id)"
              @keydown.space.prevent="irParaNegocio(negocio.id)"
            >
              <td v-if="isColumnVisible('codigo')">#{{ String(negocio.codigo).padStart(3, '0') }}</td>
              <td v-if="isColumnVisible('cliente')">{{ negocio.cliente?.nome || 'N/A' }}</td>
              <td v-if="isColumnVisible('dataVenda')">{{ formatarData(negocio.dataVenda as string) }}</td>
              <td v-if="isColumnVisible('dataEntrega')">{{ formatarData(negocio.dataEntrega as string) }}</td>
              <td v-if="isColumnVisible('entrega')">{{ negocio.entrega ? 'Sim' : 'Não' }}</td>
              <td v-if="isColumnVisible('itens')">{{ negocio.produtos?.length || 0 }}</td>
              <td v-if="isColumnVisible('descontoGeral')">{{ formatCurrency(negocio.descontoGeral) }}</td>
              <td v-if="isColumnVisible('valorFinal')">{{ formatCurrency(negocio.valorFinal) }}</td>
              <td v-if="isColumnVisible('acoes')">
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn icon variant="text" size="small" v-bind="props" @click.stop>
                      <v-icon icon="mdi-dots-vertical" />
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item title="Editar" @click.stop="irParaEdicao(negocio.id)" />
                    <v-list-item title="Excluir" @click.stop="abrirConfirmacaoExcluir(negocio.id)" />
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div v-if="filteredNegocios.length === 0" class="empty-state">
          <v-icon icon="mdi-handshake" size="64" color="grey-lighten-1" class="mb-4" />
          <p class="text-h6 text-grey-darken-1 mb-2">Você ainda não tem Negócios</p>
          <p class="text-body-2 text-grey mb-6">Cadastre seu primeiro negócio aqui</p>
          <v-btn color="primary" to="/negocios/novo" prepend-icon="mdi-plus">
            Novo Negócio
          </v-btn>
        </div>
      </template>
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
import { useRouter } from 'vue-router'
import { useNegociosStore } from '../../stores/negociosStore'
import { useModulesStore } from '../../stores/modulesStore'
import ColumnManagerMenu from '../../components/common/ColumnManagerMenu.vue'
import { useColumnManager } from '../../composables/useColumnManager'

const router = useRouter()
const negociosStore = useNegociosStore()
const { negocios, carregarNegocios, deletarNegocio, carregando } = negociosStore
const modulesStore = useModulesStore()
const search = ref('')

const {
  columns,
  visibleColumns,
  isColumnVisible,
  selectAllColumns,
  resetColumns,
} = useColumnManager('crm.columns.negocios', [
  { key: 'codigo', label: 'Código' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'dataVenda', label: 'Data da Venda' },
  { key: 'dataEntrega', label: 'Data de Entrega', defaultVisible: false },
  { key: 'entrega', label: 'Entrega' },
  { key: 'itens', label: 'Itens/Unidades' },
  { key: 'descontoGeral', label: 'Desconto Geral', defaultVisible: false },
  { key: 'valorFinal', label: 'Valor Final' },
  { key: 'acoes', label: 'Ações', locked: true },
])

const filteredNegocios = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return negocios.value

  return negocios.value.filter((negocio) => {
    const text = [
      negocio.codigo,
      negocio.cliente?.nome,
      negocio.dataVenda,
      negocio.dataEntrega,
      negocio.entrega ? 'sim' : 'nao',
      negocio.descontoGeral,
      negocio.valorFinal,
      negocio.produtos?.length,
    ]
      .filter((value) => value !== undefined && value !== null)
      .join(' ')
      .toLowerCase()

    return text.includes(term)
  })
})

const confirmarExcluir = ref(false)
const negocioSelecionado = ref<string | null>(null)
const itensHeader = ref('Itens')

const irParaNegocio = (id: string) => {
  router.push(`/negocios/${id}`)
}

const irParaEdicao = (id: string) => {
  router.push(`/negocios/${id}/editar`)
}

const abrirConfirmacaoExcluir = (id: string) => {
  negocioSelecionado.value = id
  confirmarExcluir.value = true
}

const confirmarExclusao = async () => {
  if (negocioSelecionado.value) {
    await deletarNegocio(negocioSelecionado.value)
  }
  confirmarExcluir.value = false
}

const formatarData = (data?: string) => {
  if (!data) return '-'
  if (data.includes('-')) {
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
  }
  return new Date(data).toLocaleDateString('pt-BR')
}

const formatCurrency = (value: number | string | undefined) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '-'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

onMounted(() => {
  modulesStore.fetchConfig().then(() => {
    itensHeader.value = modulesStore.produtoModulo === 'IMOBILIARIA' ? 'Unidades' : 'Itens'
  })
  carregarNegocios()
})
</script>

<style scoped>
.page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.search-field {
  width: 240px;
}

.page-header h2 {
  margin: 0;
  color: #111827;
}

.subtitle {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.table-card {
  border-radius: 16px;
}

.clickable-row {
  cursor: pointer;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}
</style>
