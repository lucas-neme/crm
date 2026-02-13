<template>
  <v-container v-if="empreendimento" fluid class="page">
    <v-row class="page-header">
      <v-col cols="12" md="8">
        <div class="header-title-line">
          <h2>{{ empreendimento.nome }}</h2>
          <v-chip class="status-chip" :color="statusColor(empreendimento.status)">
            {{ formatStatus(empreendimento.status) }}
          </v-chip>
        </div>
        <div class="header-meta">
          <div class="text-subtitle-1">{{ locationText }}</div>
        </div>
      </v-col>
      <v-col cols="12" md="4" class="text-right">
        <v-btn color="primary" variant="outlined" class="mr-2" :to="`/imoveis/${empreendimento.id}/editar`">Editar</v-btn>
      </v-col>
    </v-row>

    <v-card class="content-card">
      <v-tabs v-model="tab" bg-color="surface">
        <v-tab value="unidades">Unidades</v-tab>
        <v-tab value="detalhes">Detalhes</v-tab>
        <v-tab value="midias">Mídias</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          
          <!-- UNIDADES TAB -->
          <v-window-item value="unidades">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3>Unidades do Empreendimento</h3>
              <unidade-create-dialog :empreendimento-id="empreendimento.id" />
            </div>

            <v-data-table
               :headers="unidadeHeaders"
               :items="store.unidades"
               :loading="store.loading"
               density="compact"
            >
               <template v-slot:item.valor="{ item }">
                 {{ formatCurrency(item.valorOferta || item.valorTabela) }}
               </template>
                <template v-slot:item.area="{ item }">
                  {{ formatArea(item.areaPrivativa) }} m²
                </template>
               <template v-slot:item.status="{ item }">
                  <v-chip size="x-small" :color="statusUnidadeColor(item.statusUnidade)">
                      {{ item.statusUnidade }}
                  </v-chip>
               </template>
               <template v-slot:item.actions="{ item }">
                 <div class="d-flex align-center">
                   <reserva-create-dialog :unidade="item" @success="refreshData" />
                   <proposta-create-dialog :unidade="item" @success="refreshData" />
                   <v-btn icon="mdi-pencil" size="small" variant="text" class="ml-1" @click="editarUnidade(item)"></v-btn>
                 </div>
               </template>
            </v-data-table>
            <unidade-edit-dialog 
              v-if="selectedUnit"
              v-model="editDialog" 
              :unidade="selectedUnit" 
              @saved="refreshData" 
            />
          </v-window-item>

          <!-- DETALHES TAB -->
          <v-window-item value="detalhes">
            <v-row>
                <v-col cols="12" md="6">
                    <p><strong>Descrição Curta:</strong> {{ empreendimento.descricaoCurta }}</p>
                    <p><strong>Previsão de Entrega:</strong> {{ formatDate(empreendimento.previsaoEntrega) }}</p>
                </v-col>
                <v-col cols="12" md="6">
                    <p><strong>Endereço:</strong> {{ locationText }}</p>
                    <p><strong>CEP:</strong> {{ empreendimento.enderecoCep }}</p>
                </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="midias">
              <v-empty-state icon="mdi-image-multiple" title="Em breve" text="Gestão de Mídias e Tabela de Vendas (PDF)"></v-empty-state>
          </v-window-item>

        </v-window>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useImoveisStore } from '../../stores/imoveisStore'
import UnidadeCreateDialog from './UnidadeCreateDialog.vue'
import ReservaCreateDialog from './ReservaCreateDialog.vue'
import PropostaCreateDialog from './PropostaCreateDialog.vue'
import UnidadeEditDialog from './UnidadeEditDialog.vue'
import type { Unidade } from '../../stores/imoveisStore'

const route = useRoute()
const store = useImoveisStore()
const tab = ref('unidades')
const editDialog = ref(false)
const selectedUnit = ref<Unidade | null>(null)

const empreendimento = computed(() => store.currentEmpreendimento)

const editarUnidade = (unidade: Unidade) => {
    selectedUnit.value = unidade
    editDialog.value = true
}

const locationText = computed(() => {
    if(!empreendimento.value) return ''
    return `${empreendimento.value.enderecoLogradouro || ''}, ${empreendimento.value.enderecoNumero || ''} - ${empreendimento.value.enderecoBairro || ''}, ${empreendimento.value.enderecoCidade || ''}`
})

const unidadeHeaders = [
    { title: 'Código', key: 'codigoInterno' },
    { title: 'Tipo', key: 'tipo' },
    { title: 'Tipologia', key: 'tipologia' },
    { title: 'Andar', key: 'andar' },
    { title: 'Área', key: 'area' },
    { title: 'Quartos', key: 'quartos' },
    { title: 'Valor', key: 'valor' },
    { title: 'Status', key: 'status' },
    { title: 'Ações', key: 'actions' },
]

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

const statusUnidadeColor = (status: string) => {
    if(status === 'DISPONIVEL') return 'success'
    if(status === 'RESERVADO') return 'warning'
    if(status === 'VENDIDO') return 'error'
    return 'grey'
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatArea = (val: number) => {
    if (!val) return '0,00'
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)
}

const formatDate = (date: any) => {
    if(!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
}

const refreshData = async () => {
    const id = route.params.id as string
    await store.fetchUnidades(id)
}

onMounted(async () => {
    const id = route.params.id as string
    await store.fetchEmpreendimento(id)
    if(store.currentEmpreendimento) {
        store.fetchUnidades(id)
    }
})
</script>

<style scoped>
.page {
  padding: 0;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  margin: 0;
  color: #111827;
}

.header-title-line {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.8rem;
}

.status-chip {
  width: fit-content;
  align-self: center;
}

.header-meta {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.content-card {
  margin-top: 0;
}
</style>
