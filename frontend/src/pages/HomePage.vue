<template>
  <v-container fluid class="pa-6">
    <!-- Stats Row -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="4">
        <v-card class="stats-card" elevation="0">
          <div class="stats-content">
            <span class="stats-label">Clientes</span>
            <div class="stats-value">{{ clientes.length }}</div>
            <span class="stats-sub">Clientes cadastrados</span>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="stats-card" elevation="0">
          <div class="stats-content">
            <span class="stats-label">Produtos</span>
            <div class="stats-value">{{ produtos.length }}</div>
            <span class="stats-sub">Itens em estoque</span>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="stats-card" elevation="0">
          <div class="stats-content">
            <span class="stats-label">Negócios</span>
            <div class="stats-value">{{ negocios.length }}</div>
            <span class="stats-sub">Pedidos cadastrados</span>
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
  border-radius: 12px;
  background: white;
  border: 1px solid #eef2f6; 
  height: 100%;
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
    display: block;
    margin-bottom: 0.5rem;
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
