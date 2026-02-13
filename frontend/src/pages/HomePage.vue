<template>
  <v-container fluid :class="mobile ? 'pa-4' : 'pa-6'">
    <!-- Stats Row -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="stats-card" elevation="0" to="/clientes">
          <div class="d-flex align-start justify-space-between">
            <div class="stats-content">
              <div class="d-flex align-center mb-2">
                 <v-icon icon="mdi-account-outline" class="mr-2 text-primary mt-n1" size="20" />
                 <span class="stats-label">Clientes</span>
              </div>
              <div class="stats-value">{{ clientes.length }}</div>
              <span class="stats-sub">Clientes cadastrados</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="stats-card" elevation="0" to="/produtos">
          <div class="d-flex align-start justify-space-between">
            <div class="stats-content">
              <div class="d-flex align-center mb-2">
                 <v-icon icon="mdi-package-variant" class="mr-2 text-primary mt-n1" size="20" />
                 <span class="stats-label">Produtos</span>
              </div>
              <div class="stats-value">{{ produtos.length }}</div>
              <span class="stats-sub">Itens em estoque</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card class="stats-card" elevation="0" to="/negocios">
          <div class="d-flex align-start justify-space-between">
             <div class="stats-content">
              <div class="d-flex align-center mb-2">
                 <v-icon icon="mdi-handshake-outline" class="mr-2 text-primary mt-n1" size="20" />
                 <span class="stats-label">Negócios</span>
              </div>
              <div class="stats-value">{{ negocios.length }}</div>
              <span class="stats-sub">Pedidos cadastrados</span>
            </div>
          </div>
        </v-card>
      </v-col>
      
      <!-- Resumo Financeiro (Mock) -->
      <v-col cols="12">
        <v-card class="stats-card" elevation="0">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="stats-header-title">Resumo Financeiro</span>
            <v-icon icon="mdi-dots-horizontal" color="grey" />
          </div>
          
          <div class="d-flex align-center flex-wrap my-2">
             <span class="text-h5 font-weight-bold mr-2">R$ 45.500</span>
             <span class="text-caption text-grey mx-1">|</span>
             <span class="text-caption text-grey">Faturamento do mês <strong class="text-black">76%</strong></span>
          </div>

          <div class="d-flex justify-space-between align-center mt-3 pt-3 border-t">
              <span class="text-body-2 text-grey-darken-1">Total de vendas</span>
              <span class="font-weight-bold">17</span>
          </div>
           <div class="d-flex justify-space-between align-center mt-2">
              <span class="text-body-2 text-grey-darken-1">Ticket médio</span>
              <div class="d-flex align-center">
                  <div class="progress-mock mr-2"></div>
                  <span class="font-weight-bold">R$ 2,682</span>
              </div>
          </div>
        </v-card>
      </v-col>

      <!-- Performance (Mock) -->
      <v-col cols="12">
        <v-card class="stats-card" elevation="0">
           <div class="stats-content">
              <span class="stats-header-title d-block mb-1">Performance</span>
              <div class="d-flex align-center justify-space-between">
                  <span class="stats-sub">Últimos 7 dias</span>
                  <v-chip color="success" size="x-small" label class="font-weight-bold">+28%</v-chip>
              </div>
              <div class="chart-placeholder mt-4">
                 <svg viewBox="0 0 100 25" class="chart-svg">
                    <path d="M0,25 L0,20 C10,18 20,22 30,15 C40,8 50,15 60,10 C70,5 80,12 90,8 L100,5 L100,25 Z" fill="url(#gradient)" opacity="0.2" />
                    <path d="M0,20 C10,18 20,22 30,15 C40,8 50,15 60,10 C70,5 80,12 90,8 L100,5" fill="none" stroke="#3b82f6" stroke-width="2" />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="#3b82f6" stop-opacity="1" />
                            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                        </linearGradient>
                    </defs>
                 </svg>
              </div>
           </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions Section (Desktop Only) -->
    <v-card v-if="!mobile" class="section-card mb-6" elevation="0">
      <div class="section-header">
        <h2 class="section-title">Ações rápidas</h2>
        <p class="section-desc">Gerencie tarefas rapidamente</p>
      </div>

      <v-row>
        <v-col cols="12" md="4">
          <v-card class="action-btn-card" variant="outlined" to="/clientes/novo">
            <div class="text-center">
              <div class="action-btn-label">+ Novo Cliente</div>
              <div class="action-btn-sub">Cadastrar clientes rapidamente</div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="action-btn-card" variant="outlined" to="/produtos/novo">
            <div class="text-center">
              <div class="action-btn-label">+ Novo Produto</div>
              <div class="action-btn-sub">Gerencie itens do catálogo</div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="action-btn-card" variant="outlined" to="/negocios/novo">
            <div class="text-center">
              <div class="action-btn-label">+ Novo Negócio</div>
              <div class="action-btn-sub">Gerencie pedidos dos clientes</div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- Power BI Section -->
    <v-card class="section-card" elevation="0">
      <div class="section-header">
        <h2 class="section-title">Power BI Dashboard</h2>
        <p class="section-desc">Aguardando integração</p>
      </div>
      
      <div class="powerbi-placeholder">
        Aguardando Power BI...
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useClientesStore } from '../stores/clientesStore'
import { useProdutosStore } from '../stores/produtosStore'
import { useNegociosStore } from '../stores/negociosStore'

const { mobile } = useDisplay()
const clientesStore = useClientesStore()
const produtosStore = useProdutosStore()
const negociosStore = useNegociosStore()

const clientes = computed(() => clientesStore.clientes.value || [])
const produtos = computed(() => produtosStore.produtos.value || [])
const negocios = computed(() => negociosStore.negocios.value || [])

onMounted(async () => {
    await Promise.all([
        clientesStore.carregarClientes(),
        produtosStore.carregarProdutos(),
        negociosStore.carregarNegocios()
    ])
})
</script>

<style scoped>
.stats-card {
  padding: 1.5rem;
  border-radius: 16px;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.6); 
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05) !important;
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1) !important;
}

/* Mobile optimizations for stats */
@media (max-width: 600px) {
    .stats-card {
        padding: 1.25rem;
    }
}

.stats-label {
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1;
}

.stats-value {
    font-size: 3rem;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.1;
    margin-bottom: 0.5rem;
}
.stats-sub {
    font-size: 0.85rem;
    color: #94a3b8;
}

.stats-header-title {
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
}

.border-t {
    border-top: 1px solid #f1f5f9;
}

.progress-mock {
    width: 80px;
    height: 10px;
    background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
    border-radius: 5px;
}

.chart-svg {
    width: 100%;
    height: 50px;
    display: block;
}

.section-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid #eef2f6;
}

.section-header {
    margin-bottom: 1.5rem;
}

.section-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.25rem;
}

.section-desc {
    color: #64748b;
    font-size: 0.85rem;
}

.action-btn-card {
    border-radius: 8px;
    border-color: #cbd5e1;
    padding: 1.5rem 1rem;
    transition: all 0.2s;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-btn-card:hover {
    border-color: #3b82f6;
    background-color: #f8fafc;
}

.action-btn-label {
    font-weight: 700;
    color: #1e293b;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
}

.action-btn-sub {
    font-size: 0.75rem;
    color: #64748b;
}

.powerbi-placeholder {
    height: 150px;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 0.9rem;
    background-color: #f8fafc;
}
</style>
