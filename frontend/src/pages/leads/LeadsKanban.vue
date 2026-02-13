<template>
  <v-container fluid class="page">
    <div class="page-header">
      <div class="title-row">
        <h2 class="page-title">Funil de Vendas (Leads)</h2>
      </div>
      <div class="filter-row">
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
          v-model="visibleStageIds"
          :columns="availableStages"
          @reset="resetStages"
          @select-all="selectAllStages"
        />
        <v-btn color="primary" prepend-icon="mdi-plus" to="/clientes/novo" class="text-none">
          Novo Lead
        </v-btn>
      </div>
    </div>

    <div class="funnel-summary">
      <div
        v-for="stage in stages"
        :key="stage.id"
        class="summary-chip"
        @click="scrollToStage(stage.id)"
      >
        <span>{{ stage.title }}</span>
        <strong>{{ getLeadsInStage(stage.id).length }}</strong>
      </div>
    </div>

    <div class="kanban-container">
      <div
        v-for="stage in stages"
        :key="stage.id"
        :ref="(el) => setColumnRef(el, stage.id)"
        class="kanban-column"
      >
        <v-card
          class="column-card"
          :class="{ 'drop-target': overStageId === stage.id }"
          variant="flat"
          color="grey-lighten-4"
          @dragover.prevent="onDragOver(stage.id)"
          @dragleave="onDragLeave(stage.id)"
          @drop.prevent="onDrop(stage.id)"
        >
          <v-card-title class="d-flex justify-space-between align-center py-2 px-3 bg-grey-lighten-2">
            <span class="text-subtitle-2 font-weight-bold">{{ stage.title }}</span>
            <v-chip size="x-small" color="primary" variant="flat">{{ getLeadsInStage(stage.id).length }}</v-chip>
          </v-card-title>

          <v-divider></v-divider>

          <div class="leads-list pa-2">
            <v-card
              v-for="lead in getLeadsInStage(stage.id)"
              :key="lead.id"
              class="mb-2 lead-card clickable"
              :class="{ dragging: draggedLeadId === lead.id }"
              elevation="1"
              draggable="true"
              @dragstart="onDragStart(lead.id)"
              @dragend="onDragEnd"
              @click="verDetalhes(lead.id)"
            >
              <v-card-text class="pa-3">
                <div class="d-flex justify-space-between align-start mb-1">
                  <span class="text-body-2 font-weight-bold">{{ lead.nome }}</span>
                  <v-icon
                    :color="getTemperaturaColor(lead.temperatura)"
                    :icon="getTemperaturaIcon(lead.temperatura)"
                    size="small"
                  ></v-icon>
                </div>
                <div class="text-caption text-grey-darken-1 mb-2">
                  {{ lead.email || lead.telefone || 'Sem contato' }}
                </div>
                <div class="d-flex justify-space-between align-center">
                  <v-chip size="x-small" variant="tonal">{{ lead.origem || 'Direto' }}</v-chip>
                  <span class="text-caption text-grey">{{ formatDate(lead.dataUltimaInteracao) }}</span>
                </div>
              </v-card-text>
            </v-card>

            <div v-if="getLeadsInStage(stage.id).length === 0" class="text-center py-4 text-caption text-grey">
              Nenhum lead nesta etapa
            </div>
          </div>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useClientesStore } from '../../stores/clientesStore'
import ColumnManagerMenu from '../../components/common/ColumnManagerMenu.vue'

const router = useRouter()
const { mobile } = useDisplay()
const store = useClientesStore()

const draggedLeadId = ref<string | null>(null)
const overStageId = ref<string | null>(null)
const suppressClick = ref(false)
const search = ref('')
const searchMenu = ref(false)

const allStages = [
  { id: 'NOVO', title: 'Novo Lead', key: 'NOVO', label: 'Novo Lead' },
  { id: 'CONTATO', title: 'Contato', key: 'CONTATO', label: 'Contato' },
  { id: 'VISITA', title: 'Agendamento/Visita', key: 'VISITA', label: 'Agendamento/Visita' },
  { id: 'PROPOSTA', title: 'Proposta', key: 'PROPOSTA', label: 'Proposta' },
  { id: 'RESERVA', title: 'Reserva', key: 'RESERVA', label: 'Reserva' },
  { id: 'CONTRATO', title: 'Em Contrato', key: 'CONTRATO', label: 'Em Contrato' },
  { id: 'GANHO', title: 'Venda Concluída', key: 'GANHO', label: 'Venda Concluída' },
]

const visibleStageIds = ref<string[]>(allStages.map(s => s.id))
const availableStages = computed(() => allStages.map(s => ({ ...s, locked: false })))

const stages = computed(() => allStages.filter(s => visibleStageIds.value.includes(s.id)))

const resetStages = () => {
  visibleStageIds.value = allStages.map(s => s.id)
}

const selectAllStages = () => {
  visibleStageIds.value = allStages.map(s => s.id)
}

const getLeadsInStage = (stageId: string) => {
  let items = store.clientes.value.filter((c) => (c.pipelineStage || 'NOVO') === stageId)
  if (search.value) {
    const s = search.value.toLowerCase()
    items = items.filter(
      (c) =>
        c.nome.toLowerCase().includes(s) ||
        (c.email && c.email.toLowerCase().includes(s)) ||
        (c.telefone && c.telefone.includes(s))
    )
  }
  return items
}

const getTemperaturaColor = (temp?: string) => {
  const normalized = (temp || '').toUpperCase().trim()
  if (normalized.includes('QUENT')) return '#e53935'
  if (normalized.includes('MORN')) return '#fb8c00'
  if (normalized.includes('FRI')) return '#1e88e5'
  return '#9aa7ba'
}

const getTemperaturaIcon = (temp?: string) => {
  const normalized = (temp || '').toUpperCase().trim()
  if (normalized.includes('QUENT')) return 'mdi-thermometer-high'
  if (normalized.includes('MORN')) return 'mdi-thermometer'
  if (normalized.includes('FRI')) return 'mdi-thermometer-low'
  return 'mdi-thermometer-off'
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

const onDragStart = (leadId: string) => {
  draggedLeadId.value = leadId
  suppressClick.value = true
}

const onDragOver = (stageId: string) => {
  overStageId.value = stageId
}

const onDragLeave = (stageId: string) => {
  if (overStageId.value === stageId) {
    overStageId.value = null
  }
}

const onDrop = async (stageId: string) => {
  const leadId = draggedLeadId.value
  overStageId.value = null

  if (!leadId) return

  const lead = store.clientes.value.find((item) => item.id === leadId)
  if (!lead) return

  const currentStage = lead.pipelineStage || 'NOVO'
  if (currentStage === stageId) return

  const previousStage = currentStage
  lead.pipelineStage = stageId

  try {
    await store.atualizarCliente(leadId, {
      pipelineStage: stageId,
    })
    await store.carregarClientes()
  } catch (error) {
    lead.pipelineStage = previousStage
    console.error('Erro ao atualizar etapa do lead:', error)
  }
}

const onDragEnd = () => {
  draggedLeadId.value = null
  overStageId.value = null
  setTimeout(() => {
    suppressClick.value = false
  }, 40)
}

const verDetalhes = (id: string) => {
  if (suppressClick.value) return
  router.push(`/clientes/${id}`)
}

const columnRefs = ref<Record<string, HTMLElement>>({})

const setColumnRef = (el: any, id: string) => {
  if (el) columnRefs.value[id] = el as HTMLElement
}

const scrollToStage = (stageId: string) => {
  const el = columnRefs.value[stageId]
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
}

onMounted(() => {
  store.carregarClientes()
})
</script>

<style scoped>
.page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.title-row {
  display: flex;
  align-items: center;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.search-field {
  width: 240px;
}

.search-popover {
  border-radius: 12px;
}

.page-title {
  margin: 0;
  color: #111827;
}

.funnel-summary {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  margin-bottom: 0.7rem;
}

.summary-chip {
  flex: 0 0 auto;
  border: 1px solid #cfdef1;
  border-radius: 999px;
  background: #f7fbff;
  color: #28476e;
  padding: 0.3rem 0.65rem;
  font-size: 0.77rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
}

.summary-chip:hover {
  background: #eef5ff;
  border-color: #3b82f6;
}

.summary-chip strong {
  background: #1e5ca9;
  color: #fff;
  border-radius: 999px;
  min-width: 20px;
  text-align: center;
  padding: 0.08rem 0.35rem;
  font-size: 0.72rem;
}

.kanban-container {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding-bottom: 1rem;
  min-height: calc(100vh - 240px);
  scroll-snap-type: x mandatory;
}

.kanban-column {
  flex: 0 0 320px;
  min-width: 320px;
  scroll-snap-align: start;
}

.column-card {
  height: 100%;
  border-radius: 8px;
  transition: box-shadow 0.18s ease, outline-color 0.18s ease;
  outline: 2px solid transparent;
}

.column-card.drop-target {
  outline-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
}

.leads-list {
  max-height: calc(100vh - 260px);
  overflow-y: auto;
}

.lead-card {
  border-left: 4px solid #3b82f6;
  transition: transform 0.2s, opacity 0.2s;
}

.lead-card.dragging {
  opacity: 0.45;
}

.lead-card:hover {
  transform: translateY(-2px);
}

.clickable {
  cursor: pointer;
}

@media (max-width: 960px) {
  .page-header {
    margin-bottom: 0.85rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.8rem;
  }

  .title-row {
    justify-content: space-between;
  }

  .filter-row {
    width: 100%;
    justify-content: start;
    overflow-x: auto;
    padding-bottom: 0.2rem;
  }
  
  .search-field {
    width: 100%;
  }

  .kanban-container {
    gap: 0.6rem;
    min-height: calc(100vh - 215px);
  }

  .kanban-column {
    flex-basis: 86vw;
    min-width: 86vw;
  }

  .leads-list {
    max-height: calc(100vh - 305px);
  }
}
</style>
