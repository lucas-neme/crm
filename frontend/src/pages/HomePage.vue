<template>
  <div class="dashboard">
    <v-container fluid class="dashboard-content">
      <v-row class="mb-4" align="stretch">
        <v-col cols="12" md="4">
          <v-card class="stat-card" elevation="2">
            <div class="stat-content">
              <div>
                <p class="stat-label">Clientes</p>
                <h3 class="stat-value">{{ clientesCount }}</h3>
                <p class="stat-sub">Clientes cadastrados</p>
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="stat-card" elevation="2">
            <div class="stat-content">
              <div>
                <p class="stat-label">Produtos</p>
                <h3 class="stat-value">{{ produtosCount }}</h3>
                <p class="stat-sub">Itens em estoque</p>
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="stat-card" elevation="2">
            <div class="stat-content">
              <div>
                <p class="stat-label">Negócios</p>
                <h3 class="stat-value">{{ negociosCount }}</h3>
                <p class="stat-sub">Pedidos cadastrados</p>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="section-card" elevation="2">
        <v-card-title>Ações rápidas</v-card-title>
        <v-card-subtitle>Gerencie tarefas rapidamente</v-card-subtitle>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="action-card" @click="navigateTo('/clientes/novo')">
                <v-card-text class="action-content">
                  <div class="action-title">+ Novo Cliente</div>
                  <div class="action-sub">Cadastrar clientes rapidamente</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="action-card" @click="navigateTo('/produtos/novo')">
                <v-card-text class="action-content">
                  <div class="action-title">+ Novo Produto</div>
                  <div class="action-sub">Gerencie itens do catálogo</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card variant="outlined" class="action-card" @click="navigateTo('/negocios/novo')">
                <v-card-text class="action-content">
                  <div class="action-title">+ Novo Negócio</div>
                  <div class="action-sub">Gerencie pedidos dos clientes</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="section-card mt-6" elevation="2">
        <v-card-title>Power BI Dashboard</v-card-title>
        <v-card-subtitle>Aguardando integração</v-card-subtitle>
        <v-card-text>
          <div class="placeholder">Aguardando Power BI...</div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>

  <v-snackbar v-model="snackbar" color="success" timeout="2000" location="bottom right">
    Configurações salvas com sucesso!
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useClientesStore } from '../stores/clientesStore'
import { useProdutosStore } from '../stores/produtosStore'
import { useNegociosStore } from '../stores/negociosStore'

const router = useRouter()
const { clientes, carregarClientes } = useClientesStore()
const { produtos, carregarProdutos } = useProdutosStore()
const { negocios, carregarNegocios } = useNegociosStore()

const snackbar = ref(false)

const clientesCount = computed(() => clientes.value.length)
const produtosCount = computed(() => produtos.value.length)
const negociosCount = computed(() => negocios.value.length)

const navigateTo = (path: string) => {
  router.push(path)
}

onMounted(async () => {
  await Promise.all([carregarClientes(), carregarProdutos(), carregarNegocios()])
  const shouldShow = localStorage.getItem('crm.showSavedSnackbar') === 'true'
  if (shouldShow) {
    localStorage.removeItem('crm.showSavedSnackbar')
    snackbar.value = true
  }
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
}

.dashboard-content {
  padding: 0.5rem 0;
  flex: 1;
}

.stat-card {
  border-radius: 16px;
}

.stat-content {
  padding: 1.25rem 1.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.9rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.stat-sub {
  font-size: 0.85rem;
  color: #9ca3af;
}

.section-card {
  border-radius: 16px;
}

.action-card {
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.action-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.action-content {
  text-align: center;
}

.action-title {
  font-weight: 600;
  color: #111827;
}

.action-sub {
  font-size: 0.85rem;
  color: #6b7280;
}

.placeholder {
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: #9ca3af;
}
</style>
