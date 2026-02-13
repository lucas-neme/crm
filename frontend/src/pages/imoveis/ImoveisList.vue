<template>
  <v-container fluid class="page">
    <v-row class="page-header" align="start">
      <v-col>
        <h2 class="page-title">Empreendimentos</h2>
        <p class="summary-text">{{ empreendimentos.length }} empreendimentos cadastrados</p>
      </v-col>
      <v-col class="text-right header-actions">
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
        <v-btn color="primary" to="/imoveis/novo" class="text-none">
          <v-icon start icon="mdi-plus"></v-icon>
          Novo Empreendimento
        </v-btn>
      </v-col>
    </v-row>

    <v-card elevation="2" class="table-card">
      <v-skeleton-loader
        v-if="store.loading"
        type="table-heading, table-row-divider@6"
        class="bg-transparent"
      ></v-skeleton-loader>

      <template v-else>
        <v-data-table
          v-if="filteredEmpreendimentos.length > 0"
          :headers="headers"
          :items="filteredEmpreendimentos"
          density="comfortable"
          :row-props="() => ({ class: 'clickable-row' })"
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
import { useImoveisStore } from '../../stores/imoveisStore'
import ColumnManagerMenu from '../../components/common/ColumnManagerMenu.vue'
import { useColumnManager } from '../../composables/useColumnManager'

const store = useImoveisStore()
const router = useRouter()
const empreendimentos = computed(() => store.empreendimentos)
const search = ref('')

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
  margin-bottom: 1.5rem;
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
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
}

.search-field {
  width: 240px;
}

.table-card {
  border-radius: 16px;
  overflow: hidden;
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
</style>
