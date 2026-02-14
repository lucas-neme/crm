<template>
  <v-container fluid class="page">
    <div class="page-header" :class="{ 'mobile-header': mobile }">
      <div class="header-main">
        <div>
          <h2 class="page-title">Gestão de Reservas</h2>
          <p v-if="!mobile" class="summary-text">{{ store.reservas.length }} reservas ativas/recentes</p>
        </div>
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
      </div>
    </div>


    <v-card elevation="2" class="table-card">
      <v-skeleton-loader
        v-if="store.loading"
        type="table-heading, table-row-divider@6"
        class="bg-transparent"
      ></v-skeleton-loader>

      <template v-else>
        <div v-if="mobile && filteredReservas.length > 0" class="mobile-list">
          <v-card
            v-for="item in filteredReservas"
            :key="item.id"
            class="mobile-item"
            elevation="1"
          >
            <div class="mobile-item-head">
              <div>
                <h3 class="mobile-name">{{ item.cliente?.nome }}</h3>
                <p class="mobile-meta">Unidade: {{ item.unidade?.codigoInterno }}</p>
              </div>
              <v-chip :color="statusColor(item.status)" size="small" variant="flat">{{ formatStatus(item.status) }}</v-chip>
            </div>
            <p class="mobile-meta">{{ formatDate(item.dataInicio) }} até {{ formatDate(item.dataFim) }}</p>
            <p class="mobile-meta">{{ item.observacoes || '-' }}</p>
            <div class="mobile-actions">
              <v-btn size="small" variant="tonal" color="primary" @click.stop="abrirEdicao(item)">Editar</v-btn>
              <v-btn size="small" variant="tonal" color="error" @click.stop="excluir(item.id)">Excluir</v-btn>
            </div>
          </v-card>
        </div>

        <v-data-table
          v-else-if="filteredReservas.length > 0"
          :headers="headers"
          :items="filteredReservas"
          density="comfortable"
          items-per-page-text="Itens por página:"
          page-text="{0}-{1} de {2}"
        >
          <template #item.cliente="{ item }">
            <div class="d-flex flex-column">
              <span class="font-weight-bold">{{ item.cliente?.nome }}</span>
              <span class="text-caption text-grey">{{ item.cliente?.telefone }}</span>
            </div>
          </template>

          <template #item.unidade="{ item }">
            {{ item.unidade?.codigoInterno }}
          </template>

          <template #item.periodo="{ item }">
            <div class="text-caption">
              {{ formatDate(item.dataInicio) }} até {{ formatDate(item.dataFim) }}
            </div>
          </template>

          <template #item.dataInicio="{ item }">{{ formatDate(item.dataInicio) }}</template>
          <template #item.dataFim="{ item }">{{ formatDate(item.dataFim) }}</template>

          <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small" variant="flat">
              {{ formatStatus(item.status) }}
            </v-chip>
          </template>

          <template #item.observacoes="{ item }">
            {{ item.observacoes || '-' }}
          </template>

          <template #item.actions="{ item }">
            <v-menu>
              <template #activator="{ props }">
                <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" @click.stop />
              </template>
              <v-list density="compact">
                <v-list-item title="Editar" @click.stop="abrirEdicao(item)" />
                <v-list-item title="Excluir" @click.stop="excluir(item.id)" />
              </v-list>
            </v-menu>
          </template>
        </v-data-table>

        <div v-if="filteredReservas.length === 0" class="empty-state">
          <v-icon icon="mdi-calendar-check" size="64" color="grey-lighten-1" class="mb-4" />
          <p class="text-h6 text-grey-darken-1 mb-2">Você ainda não tem Reservas</p>
          <p class="text-body-2 text-grey mb-6">Cadastre sua primeira reserva através da tela de Unidades</p>
        </div>
      </template>
    </v-card>

    <v-dialog v-model="editarDialog" max-width="560">
      <v-card class="rounded-lg">
        <v-card-title class="text-h6 font-weight-bold pa-4 bg-grey-lighten-4">
          <v-icon start icon="mdi-pencil" />
          Editar reserva
        </v-card-title>
        <v-card-text class="pa-4 pt-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="editForm.dataInicio" 
                type="date" 
                label="Data início" 
                variant="outlined" 
                density="comfortable" 
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="editForm.dataFim" 
                type="date" 
                label="Data fim" 
                variant="outlined" 
                density="comfortable" 
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" class="mt-4">
              <v-textarea 
                v-model="editForm.observacoes" 
                label="Observações" 
                rows="3" 
                auto-grow
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" @click="editarDialog = false" class="text-capitalize">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" :loading="savingEdit" @click="salvarEdicao" class="text-capitalize">Salvar alterações</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useVendasStore } from '../../stores/vendasStore'
import { notificationsStore } from '../../stores/notificationsStore'
import ColumnManagerMenu from '../../components/common/ColumnManagerMenu.vue'
import { useColumnManager } from '../../composables/useColumnManager'

const store = useVendasStore()
const { mobile } = useDisplay()
const search = ref('')
const searchMenu = ref(false)

const editarDialog = ref(false)
const savingEdit = ref(false)
const reservaSelecionadaId = ref<string | null>(null)
const editForm = ref({
  dataInicio: '',
  dataFim: '',
  observacoes: '',
})

const allHeaders = [
  { title: 'Cliente', key: 'cliente' },
  { title: 'Unidade', key: 'unidade' },
  { title: 'Período', key: 'periodo' },
  { title: 'Início', key: 'dataInicio' },
  { title: 'Fim', key: 'dataFim' },
  { title: 'Status', key: 'status' },
  { title: 'Observações', key: 'observacoes' },
  { title: 'Ações', key: 'actions', sortable: false },
]

const {
  columns,
  visibleColumns,
  selectAllColumns,
  resetColumns,
  filteredHeaders,
} = useColumnManager('crm.columns.reservas', [
  { key: 'cliente', label: 'Cliente' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'periodo', label: 'Período' },
  { key: 'dataInicio', label: 'Início', defaultVisible: false },
  { key: 'dataFim', label: 'Fim', defaultVisible: false },
  { key: 'status', label: 'Status' },
  { key: 'observacoes', label: 'Observações', defaultVisible: false },
  { key: 'actions', label: 'Ações', locked: true },
])

const headers = computed(() => filteredHeaders([...allHeaders]))

const filteredReservas = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return store.reservas

  return store.reservas.filter((item) => {
    const text = [
      item.cliente?.nome,
      item.cliente?.telefone,
      item.unidade?.codigoInterno,
      item.dataInicio,
      item.dataFim,
      item.status,
      item.observacoes,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return text.includes(term)
  })
})

const statusColor = (status: string) => {
  switch (status) {
    case 'ATIVA':
    case 'CONVERTIDA':
      return 'blue'
    case 'VENCIDA':
    case 'EXPIRADA':
    case 'CANCELADA':
      return 'grey-lighten-2'
    default:
      return 'grey-lighten-2'
  }
}

const formatStatus = (status: string) => {
  switch (status) {
    case 'ATIVA': return 'Ativa'
    case 'VENCIDA': return 'Vencida'
    case 'EXPIRADA': return 'Expirada'
    case 'CANCELADA': return 'Cancelada'
    case 'CONVERTIDA': return 'Convertida'
    default: return status
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const toInputDate = (value?: string) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10)
  }
  return parsed.toISOString().slice(0, 10)
}

const abrirEdicao = (item: any) => {
  reservaSelecionadaId.value = item.id
  editForm.value = {
    dataInicio: toInputDate(item.dataInicio),
    dataFim: toInputDate(item.dataFim),
    observacoes: item.observacoes || '',
  }
  editarDialog.value = true
}

const salvarEdicao = async () => {
  if (!reservaSelecionadaId.value) return
  savingEdit.value = true
  try {
    const result = await store.updateReserva(reservaSelecionadaId.value, {
      dataInicio: editForm.value.dataInicio,
      dataFim: editForm.value.dataFim,
      observacoes: editForm.value.observacoes || null,
    })

    if (result.success) {
      editarDialog.value = false
      notificationsStore.notify('Reserva atualizada com sucesso!', 'success')
      await store.fetchReservas() // Refresh list
    } else {
      notificationsStore.notify(result.message || 'Não foi possível atualizar a reserva.', 'error')
    }
  } finally {
    savingEdit.value = false
  }
}

const excluir = async (id: string) => {
  if (confirm('Deseja excluir esta reserva?')) {
    await store.cancelReserva(id)
  }
}

onMounted(() => {
  store.fetchReservas()
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
  color: #111827;
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
</style>
