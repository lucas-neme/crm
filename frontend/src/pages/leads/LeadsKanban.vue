<template>
  <v-container fluid class="page">
    <v-row class="page-header">
      <v-col>
        <h2 class="page-title">Funil de Vendas (Leads)</h2>
      </v-col>
      <v-col class="text-right">
        <v-btn color="primary" prepend-icon="mdi-plus" to="/clientes/novo">
          Novo Lead
        </v-btn>
      </v-col>
    </v-row>

    <div class="kanban-container">
      <div v-for="stage in stages" :key="stage.id" class="kanban-column">
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClientesStore } from '../../stores/clientesStore'

const router = useRouter()
const store = useClientesStore()

const draggedLeadId = ref<string | null>(null)
const overStageId = ref<string | null>(null)
const suppressClick = ref(false)

const stages = [
  { id: 'NOVO', title: 'Novo Lead' },
  { id: 'CONTATO', title: 'Contato' },
  { id: 'VISITA', title: 'Agendamento/Visita' },
  { id: 'PROPOSTA', title: 'Proposta' },
  { id: 'RESERVA', title: 'Reserva' },
  { id: 'CONTRATO', title: 'Em Contrato' },
  { id: 'GANHO', title: 'Venda Concluída' },
]

const getLeadsInStage = (stageId: string) => {
  return store.clientes.value.filter((c) => (c.pipelineStage || 'NOVO') === stageId)
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

onMounted(() => {
  store.carregarClientes()
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
  color: #111827;
}

.kanban-container {
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  padding-bottom: 1rem;
  min-height: calc(100vh - 200px);
}

.kanban-column {
  flex: 0 0 280px;
  min-width: 280px;
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
</style>
