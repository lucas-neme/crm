<template>
  <v-container fluid class="page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Empreendimentos</h2>
        <p class="summary-text">{{ empreendimentos.length }} empreendimentos cadastrados</p>
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
            <v-btn v-bind="props" icon variant="tonal" color="primary" aria-label="Pesquisar">
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
        <v-btn color="primary" to="/imoveis/novo" class="text-none action-btn">
          <v-icon start icon="mdi-plus"></v-icon>
          Novo Empreendimento
        </v-btn>
      </div>
    </div>

    <v-card elevation="2" class="table-card">
      <v-skeleton-loader
        v-if="store.loading"
        type="table-heading, table-row-divider@6"
        class="bg-transparent"
      ></v-skeleton-loader>

      <template v-else>
        <div v-if="mobile && filteredEmpreendimentos.length > 0" class="mobile-list">
          <v-card
            v-for="item in filteredEmpreendimentos"
            :key="item.id"
            class="mobile-item"
            elevation="1"
            @click="abrirEmpreendimento(item.id)"
          >
            <div class="mobile-item-head">
              <h3 class="mobile-name">{{ item.nome }}</h3>
              <v-chip :color="statusColor(item.status)" label size="small">
                {{ formatStatus(item.status) }}
              </v-chip>
            </div>
            <p class="mobile-meta">{{ item.enderecoBairro ? `${item.enderecoBairro}, ${item.enderecoCidade}` : '-' }}</p>
            <p class="mobile-meta">Previsão: {{ item.previsaoEntrega ? formatDate(item.previsaoEntrega) : 'Não informada' }}</p>
            <p class="mobile-meta">Unidades: {{ item.unidades?.length || 0 }}</p>
            <div class="mobile-actions">
              <v-btn size="small" variant="tonal" color="primary" @click.stop="editarEmpreendimento(item.id)">Editar</v-btn>
              <v-btn size="small" variant="tonal" color="error" @click.stop="store.deleteEmpreendimento(item.id)">Excluir</v-btn>
            </div>
          </v-card>
        </div>

        <v-data-table
          v-else-if="filteredEmpreendimentos.length > 0"
          :headers="headers"
          :items="filteredEmpreendimentos"
          density="comfortable"
          :row-props="() => ({ class: 'clickable-row' })"
          items-per-page-text="Itens por página:"
          page-text="{0}-{1} de {2}"
          @click:row="onClickRow"
        >
          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" label size="small">
              {{ formatStatus(item.status) }}
            </v-chip>
          </template>
          <template #item.localizacao="{ item }">
            {{ item.enderecoBairro ? `${item.enderecoBairro}, ${item.enderecoCidade}` : '-' }}
          </template>
          <template #item.previsao="{ item }">
            {{ item.previsaoEntrega ? formatDate(item.previsaoEntrega) : 'Não informada' }}
          </template>
          <template #item.unidades="{ item }">
            {{ item.unidades?.length || 0 }} unid.
          </template>
          <template #item.descricaoCurta="{ item }">
            {{ item.descricaoCurta || '-' }}
          </template>
          <template #item.actions="{ item }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" @click.stop />
              </template>
              <v-list density="compact">
                <v-list-item title="Editar" @click.stop="editarEmpreendimento(item.id)" />
                <v-list-item title="Excluir" @click.stop="store.deleteEmpreendimento(item.id)" />
              </v-list>
            </v-menu>
          </template>
        </v-data-table>

        <div v-if="filteredEmpreendimentos.length === 0" class="empty-state">
          <v-icon icon="mdi-office-building" size="64" color="grey-lighten-1" class="mb-4" />
          <p class="text-h6 text-grey-darken-1 mb-2">Você ainda não tem Empreendimentos</p>
          <p class="text-body-2 text-grey mb-6">Cadastre seu primeiro empreendimento aqui</p>
          <v-btn color="primary" to="/imoveis/novo" prepend-icon="mdi-plus">
            Novo Empreendimento
          </v-btn>
        </div>
      </template>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useImoveisStore } from '../../stores/imoveisStore'
import ColumnManagerMenu from '../../components/common/ColumnManagerMenu.vue'
import { useColumnManager } from '../../composables/useColumnManager'

const store = useImoveisStore()
const router = useRouter()
const { mobile } = useDisplay()
const empreendimentos = computed(() => store.empreendimentos)
const search = ref('')
const searchMenu = ref(false)

const allHeaders = [
  { title: 'Nome', key: 'nome' },
  { title: 'Status', key: 'status' },
  { title: 'Localização', key: 'localizacao' },
  { title: 'UF', key: 'enderecoUf' },
  { title: 'CEP', key: 'enderecoCep' },
  { title: 'Previsão Entrega', key: 'previsao' },
  { title: 'Descrição Curta', key: 'descricaoCurta' },
  { title: 'Unidades', key: 'unidades' },
  { title: 'Ações', key: 'actions', sortable: false },
] as const

const {
  columns,
  visibleColumns,
  selectAllColumns,
  resetColumns,
  filteredHeaders,
} = useColumnManager('crm.columns.empreendimentos', [
  { key: 'nome', label: 'Nome' },
  { key: 'status', label: 'Status' },
  { key: 'localizacao', label: 'Localização' },
  { key: 'enderecoUf', label: 'UF', defaultVisible: false },
  { key: 'enderecoCep', label: 'CEP', defaultVisible: false },
  { key: 'previsao', label: 'Previsão Entrega' },
  { key: 'descricaoCurta', label: 'Descrição Curta', defaultVisible: false },
  { key: 'unidades', label: 'Unidades' },
  { key: 'actions', label: 'Ações', locked: true },
])

const headers = computed(() => filteredHeaders([...allHeaders]))

const filteredEmpreendimentos = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return empreendimentos.value

  return empreendimentos.value.filter((item) => {
    const text = [
      item.nome,
      item.status,
      item.enderecoBairro,
      item.enderecoCidade,
      item.enderecoUf,
      item.enderecoCep,
      item.previsaoEntrega,
      item.descricaoCurta,
      item.unidades?.length,
    ]
      .filter((value) => value !== undefined && value !== null)
      .join(' ')
      .toLowerCase()

    return text.includes(term)
  })
})

const statusColor = (status: string) => {
  switch (status) {
    case 'LANCAMENTO': return 'primary'
    case 'EM_OBRAS': return 'warning'
    case 'PRONTO': return 'success'
    case 'ESGOTADO': return 'grey'
    default: return 'info'
  }
}

const formatStatus = (status: string) => {
  switch (status) {
    case 'LANCAMENTO': return 'LANÇAMENTO'
    case 'EM_OBRAS': return 'EM OBRAS'
    case 'PRONTO': return 'PRONTO'
    case 'ESGOTADO': return 'ESGOTADO'
    default: return status
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const abrirEmpreendimento = (id: string) => {
  router.push(`/imoveis/${id}/unidades`)
}

const editarEmpreendimento = (id: string) => {
  router.push(`/imoveis/${id}/editar`)
}

const onClickRow = (_event: unknown, row: any) => {
  const id = row?.item?.id || row?.item?.raw?.id
  if (id) {
    abrirEmpreendimento(id)
  }
}

onMounted(() => {
  store.fetchEmpreendimentos()
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

.page-title {
  margin: 0;
}

.summary-text {
  color: #6b7280;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.search-field {
  width: 300px;
}

.search-popover {
  border-radius: 12px;
}

.table-card {
  border-radius: 16px;
  overflow: hidden;
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

.mobile-name {
  margin: 0;
  font-size: 1rem;
  color: #173a66;
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

:deep(.clickable-row) {
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
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.2rem;
    align-items: center;
  }

  .header-actions :deep(.v-btn),
  .header-actions :deep(.v-menu),
  .header-actions :deep(.column-manager-menu) {
    flex-shrink: 0;
  }

  .header-actions .action-btn {
    min-width: max-content;
  }
}
</style>
