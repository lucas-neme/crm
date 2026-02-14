<template>
  <v-container fluid class="page">
    <div class="page-header" :class="{ 'mobile-header': mobile }">
      <div class="header-main">
        <div>
          <h2 class="page-title">Negócios</h2>
          <p v-if="!mobile" class="subtitle">Gerencie seus negócios cadastrados</p>
        </div>
        <v-btn v-if="mobile" color="primary" to="/negocios/novo" icon="mdi-plus" flat />
      </div>

      <div class="header-actions">
        <v-text-field
          v-if="!mobile"
          v-model="search"
          label="Pesquisar"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          variant="outlined"
          class="search-field"
        />
        <v-menu v-if="mobile" v-model="searchMenu" :close-on-content-click="false" location="bottom start">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="tonal" class="action-icon-btn" aria-label="Pesquisar">
              <v-icon icon="mdi-magnify" />
            </v-btn>
          </template>
          <v-card min-width="260" class="search-popover">
            <v-card-text>
              <v-text-field
                v-model="search"
                label="Pesquisar"
                prepend-inner-icon="mdi-magnify"
                density="compact"
                hide-details
                variant="outlined"
                autofocus
              />
            </v-card-text>
          </v-card>
        </v-menu>
        <ColumnManagerMenu
          v-model="visibleColumns"
          :columns="columns"
          @reset="resetColumns"
          @select-all="selectAllColumns"
        />
        <v-btn v-if="!mobile" color="primary" to="/negocios/novo" class="text-none action-btn" prepend-icon="mdi-plus">
          Criar Novo
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
        <div v-if="mobile && filteredNegocios.length > 0" class="mobile-list">
          <v-card
            v-for="negocio in filteredNegocios"
            :key="negocio.id"
            class="mobile-item"
            elevation="1"
            @click="irParaNegocio(negocio.id)"
          >
            <div class="mobile-item-head">
              <div>
                <p class="mobile-code">#{{ String(negocio.codigo).padStart(3, '0') }}</p>
                <h3 class="mobile-name">{{ negocio.cliente?.nome || 'N/A' }}</h3>
              </div>
              <strong class="mobile-money">{{ formatCurrency(negocio.valorFinal) }}</strong>
            </div>
            <p class="mobile-meta">Venda: {{ formatarData(negocio.dataVenda as string) }}</p>
            <p class="mobile-meta">{{ itensHeader }}: {{ negocio.produtos?.length || 0 }}</p>
            <div class="mobile-actions">
              <v-btn size="small" variant="tonal" color="primary" @click.stop="irParaEdicao(negocio.id)">Editar</v-btn>
              <v-btn size="small" variant="tonal" color="error" @click.stop="abrirConfirmacaoExcluir(negocio.id)">Excluir</v-btn>
            </div>
          </v-card>
        </div>

        <v-table class="table" v-else-if="filteredNegocios.length > 0">
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
              v-for="negocio in paginatedNegocios"
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

          <div v-if="filteredNegocios.length > 0" class="d-flex align-center justify-end px-4 py-2 border-t text-body-2">
            <div class="d-flex align-center mr-4">
              <span class="text-grey-darken-1 mr-2">Itens por página:</span>
              <v-select
                v-model="itemsPerPage"
                :items="[10, 25, 50, 100]"
                variant="outlined"
                density="compact"
                hide-details
                class="items-per-page-select"
              />
            </div>
            
            <span class="text-grey-darken-1 mr-4">
              {{ paginationText }}
            </span>

            <div class="d-flex align-center">
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                density="comfortable"
                :disabled="page === 1"
                @click="page--"
              />
              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                density="comfortable"
                :disabled="page * itemsPerPage >= filteredNegocios.length"
                @click="page++"
              />
            </div>
          </div>

        <div v-if="filteredNegocios.length === 0" class="empty-state">
          <v-icon icon="mdi-handshake" size="64" color="grey-lighten-1" class="mb-4" />
          <p class="text-h6 text-grey-darken-1 mb-2">Você ainda não tem Negócios</p>
          <p class="text-body-2 text-grey mb-6">Cadastre seu primeiro negócio aqui</p>
          <v-btn color="primary" to="/negocios/novo" prepend-icon="mdi-plus">
            Criar Novo
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
import { useDisplay } from 'vuetify'
import { useNegociosStore } from '../../stores/negociosStore'
import { useModulesStore } from '../../stores/modulesStore'
import ColumnManagerMenu from '../../components/common/ColumnManagerMenu.vue'
import { useColumnManager } from '../../composables/useColumnManager'

const router = useRouter()
const { mobile } = useDisplay()
const negociosStore = useNegociosStore()
const { negocios, carregarNegocios, deletarNegocio, carregando } = negociosStore
const modulesStore = useModulesStore()
const search = ref('')
const searchMenu = ref(false)

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

const page = ref(1)
const itemsPerPage = ref(10)

const paginatedNegocios = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredNegocios.value.slice(start, end)
})

const paginationText = computed(() => {
  const total = filteredNegocios.value.length
  if (total === 0) return '0-0 de 0'
  const start = (page.value - 1) * itemsPerPage.value + 1
  const end = Math.min(page.value * itemsPerPage.value, total)
  return `${start}-${end} de ${total}`
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
  width: 300px;
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

.search-popover {
  border-radius: 12px;
}

.mobile-list {
  display: grid;
  gap: 0.7rem;
}

.mobile-item {
  border-radius: 14px;
  padding: 0.85rem;
  border: 1px solid #d7e3f5;
}

.mobile-item-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.6rem;
}

.mobile-code {
  margin: 0;
  font-size: 0.75rem;
  color: #667a96;
}

.mobile-name {
  margin: 0.15rem 0 0;
  font-size: 1rem;
  color: #173a66;
}

.mobile-money {
  color: #10335e;
  font-size: 0.95rem;
}

.mobile-meta {
  margin: 0.32rem 0 0;
  color: #4e6482;
  font-size: 0.87rem;
}

.mobile-actions {
  display: flex;
  gap: 0.45rem;
  margin-top: 0.8rem;
  flex-wrap: wrap;
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
@media (max-width: 960px) {
  .header-actions {
    padding-bottom: 0.2rem;
  }

  .header-actions :deep(.v-btn),
  .header-actions :deep(.v-menu),
  .header-actions :deep(.column-manager-menu) {
    flex-shrink: 0;
  }
}

.items-per-page-select {
  width: 80px;
}

.items-per-page-select :deep(.v-field__input) {
  min-height: 32px;
  padding-top: 0;
  padding-bottom: 0;
}

.border-t {
  border-top: 1px solid #e0e0e0;
}
</style>
