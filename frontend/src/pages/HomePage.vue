<template>
  <v-container fluid :class="mobile ? 'pa-4' : 'pa-8'" class="dashboard-container">
    <!-- Header Section -->
    <header class="dashboard-header mb-6">
      <div class="header-left">
        <span class="date-top">{{ currentFormattedDate }}</span>
        <h1 class="welcome-text">Olá, {{ userName }}!</h1>
        <p class="subtitle">Bem-vindo ao seu painel de controle executivo.</p>
      </div>
    </header>

    <!-- Top Metrics Row -->
    <v-row class="mb-6">
      <v-col v-for="(metric, idx) in mainMetrics" :key="idx" cols="12" sm="6" lg="3">
        <v-card class="metric-card" elevation="0" :to="metric.route">
          <div class="metric-top">
            <div class="metric-icon-box" :style="{ backgroundColor: metric.color + '20' }">
              <v-icon :icon="metric.icon" :color="metric.color" size="24" />
            </div>
            <div class="metric-details">
              <span class="metric-label">{{ metric.label }}</span>
              <div class="metric-val-row">
                <span class="metric-value">{{ metric.value }}</span>
                <v-chip v-if="metric.trend" :color="metric.trendColor" size="x-small" label class="ml-2 px-1">
                  {{ metric.trend }}
                </v-chip>
              </div>
            </div>
          </div>
          <div class="metric-sparkline mt-4">
            <svg viewBox="0 0 100 20" class="spark-svg">
              <path 
                :d="metric.sparkPath" 
                fill="none" 
                :stroke="metric.color" 
                stroke-width="2" 
                stroke-linecap="round" 
              />
            </svg>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Visual Content -->
    <v-row class="mb-6">
      <!-- Sales Chart Column -->
      <v-col cols="12" lg="8">
        <v-card class="glass-card chart-card" elevation="0">
          <div class="card-header">
            <div class="title-group">
              <h3 class="card-title">Performance de Vendas</h3>
              <p class="card-subtitle">Evolução de negócios fechados vs leads</p>
            </div>
            <v-btn-toggle v-model="chartPeriod" density="compact" mandatory variant="tonal" class="period-toggle">
              <v-btn value="7d" size="small">7D</v-btn>
              <v-btn value="30d" size="small">30D</v-btn>
              <v-btn value="all" size="small">12M</v-btn>
            </v-btn-toggle>
          </div>
          
          <div class="chart-container py-4">
            <!-- Custom Premium SVG Chart -->
            <svg viewBox="0 0 1000 300" class="main-chart-svg">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#d7b16f" stop-opacity="0.3" />
                  <stop offset="100%" stop-color="#d7b16f" stop-opacity="0" />
                </linearGradient>
              </defs>
              <!-- Grid lines -->
              <line v-for="i in 5" :key="i" x1="0" :y1="i * 60" x2="1000" :y2="i * 60" stroke="rgba(215, 177, 111, 0.05)" />
              
              <!-- Area -->
              <path d="M0,280 C100,240 200,260 300,180 C400,100 500,140 600,120 C700,100 800,220 900,180 C950,160 1000,140 1000,140 L1000,300 L0,300 Z" fill="url(#chartGradient)" />
              
              <!-- Line -->
              <path d="M0,280 C100,240 200,260 300,180 C400,100 500,140 600,120 C700,100 800,220 900,180 C950,160 1000,140" fill="none" stroke="#d7b16f" stroke-width="4" stroke-linecap="round" />
              
              <!-- Points -->
              <circle cx="300" cy="180" r="6" fill="#d7b16f" class="chart-point" />
              <circle cx="600" cy="120" r="6" fill="#d7b16f" class="chart-point" />
              <circle cx="1000" cy="140" r="6" fill="#d7b16f" class="chart-point" />
            </svg>
            
            <div class="chart-labels mt-2 d-flex justify-space-between px-2">
              <span v-for="label in ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul']" :key="label" class="chart-label">
                {{ label }}
              </span>
            </div>
          </div>
          
          <v-divider class="my-4 border-opacity-25" />
          
          <div class="card-footer d-flex ga-6">
            <div class="footer-stat">
              <span class="tiny-label">Faturamento Total</span>
              <span class="bold-val">R$ 1.2M</span>
            </div>
            <div class="footer-stat">
              <span class="tiny-label">Conversão</span>
              <span class="bold-val text-success">24.5%</span>
            </div>
            <div class="footer-stat">
              <span class="tiny-label">Avg. Ticket</span>
              <span class="bold-val">R$ 12.4k</span>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Second Column -->
      <v-col cols="12" lg="4">
        <v-card class="glass-card status-card mb-6" elevation="0">
          <div class="card-header mb-4">
            <h3 class="card-title">Distribuição de Negócios</h3>
          </div>
          <div class="donut-wrap d-flex align-center justify-center py-4">
            <svg viewBox="0 0 100 100" class="donut-svg">
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(215, 177, 111, 0.1)" stroke-width="12" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#d7b16f" stroke-width="12" stroke-dasharray="160 251.2" stroke-dashoffset="0" />
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#4caf50" stroke-width="12" stroke-dasharray="60 251.2" stroke-dashoffset="-160" />
              <text x="50" y="55" text-anchor="middle" class="donut-text" fill="#f0e6d2">{{ negociosCount }}</text>
              <text x="50" y="70" text-anchor="middle" class="donut-sub" fill="#b7aa8f">Ativos</text>
            </svg>
            <div class="donut-legend ml-6">
              <div v-for="(leg, i) in legendData" :key="i" class="legend-item mb-2">
                <span class="legend-dot" :style="{ backgroundColor: leg.color }"></span>
                <span class="legend-name">{{ leg.label }}</span>
                <span class="legend-val">{{ leg.val }}</span>
              </div>
            </div>
          </div>
        </v-card>

        <v-card class="glass-card actions-card" elevation="0">
           <div class="card-header mb-4">
            <h3 class="card-title">Ações Prioritárias</h3>
          </div>
          <v-list bg-color="transparent" class="pa-0">
            <v-list-item 
              v-for="(action, i) in quickActions" 
              :key="i" 
              :to="action.route"
              class="priority-action-item rounded-lg mb-2"
              variant="tonal"
              :color="action.color"
            >
              <template #prepend>
                <v-icon :icon="action.icon" size="20" class="mr-3" />
              </template>
              <v-list-item-title class="font-weight-bold">{{ action.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ action.sub }}</v-list-item-subtitle>
              <template #append>
                <v-icon icon="mdi-chevron-right" size="18" />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Bottom Row: Recent Activities & Module specific -->
    <v-row>
      <v-col cols="12" lg="7">
        <v-card class="glass-card full-h" elevation="0">
          <div class="card-header d-flex justify-space-between align-center mb-6">
            <h3 class="card-title">Atividades Recentes</h3>
            <v-btn variant="text" size="small" color="primary" class="text-none">Ver todas</v-btn>
          </div>
          
          <v-timeline side="end" align="start" density="compact" class="recent-timeline px-2">
            <v-timeline-item 
              v-for="(act, i) in recentActivities" 
              :key="i"
              :dot-color="act.color"
              size="x-small"
              class="mb-2"
            >
              <div class="timeline-content">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-body-2 font-weight-bold text-premium">{{ act.user }}</span>
                  <span class="text-caption text-soft">{{ act.time }}</span>
                </div>
                <p class="text-body-2 text-soft mb-0">{{ act.text }}</p>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>

      <v-col cols="12" lg="5">
        <v-card class="glass-card full-h promo-card d-flex flex-column align-center justify-center text-center pa-8" elevation="0">
          <v-icon icon="mdi-shield-crown-outline" size="64" color="primary" class="mb-4" />
          <h3 class="premium-title mb-2">CRM Elite Edition</h3>
          <p class="text-soft mb-6">Você está utilizando a versão mais atualizada da plataforma inteligente.</p>
          <v-btn color="primary" class="text-none premium-btn" prepend-icon="mdi-rocket-launch">Explorar Recursos</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '../stores/authStore'
import { useClientesStore } from '../stores/clientesStore'
import { useProdutosStore } from '../stores/produtosStore'
import { useNegociosStore } from '../stores/negociosStore'
import { useImoveisStore } from '../stores/imoveisStore'
import { useVendasStore } from '../stores/vendasStore'
import { useModulesStore } from '../stores/modulesStore'

const { mobile } = useDisplay()
const authStore = useAuthStore()
const clientesStore = useClientesStore()
const produtosStore = useProdutosStore()
const negociosStore = useNegociosStore()
const imoveisStore = useImoveisStore()
const vendasStore = useVendasStore()
const modulesStore = useModulesStore()

const chartPeriod = ref('7d')
const userName = computed(() => authStore.user?.name?.split(' ')[0] || 'Usuário')
const currentFormattedDate = computed(() => {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date())
})

const isImobiliaria = computed(() => modulesStore.produtoModulo === 'IMOBILIARIA')
const negociosCount = computed(() => negociosStore.negocios.value?.length || 0)

const mainMetrics = computed(() => [
  {
    label: 'Clientes',
    value: clientesStore.clientes.value?.length || 0,
    icon: 'mdi-account-group',
    color: '#d7b16f',
    trend: '+12%',
    trendColor: 'success',
    route: '/clientes',
    sparkPath: 'M0,15 C20,10 40,18 60,12 80,8 100,5'
  },
  {
    label: isImobiliaria.value ? 'Imóveis' : 'Produtos',
    value: isImobiliaria.value ? imoveisStore.empreendimentos.length : produtosStore.produtos.value?.length || 0,
    icon: isImobiliaria.value ? 'mdi-office-building' : 'mdi-package-variant',
    color: '#3b82f6',
    trend: '+5%',
    trendColor: 'info',
    route: isImobiliaria.value ? '/imoveis' : '/produtos',
    sparkPath: 'M0,10 C20,15 40,8 60,14 80,10 100,18'
  },
  {
    label: 'Negócios',
    value: negociosStore.negocios.value?.length || 0,
    icon: 'mdi-handshake',
    color: '#10b981',
    trend: '+28%',
    trendColor: 'success',
    route: '/negocios',
    sparkPath: 'M0,18 C20,14 40,18 60,10 80,4 100,2'
  },
  {
    label: 'Conversão',
    value: '24.5%',
    icon: 'mdi-trending-up',
    color: '#8b5cf6',
    trend: '+3.2%',
    trendColor: 'success',
    route: '/leads',
    sparkPath: 'M0,12 C20,10 40,15 60,8 80,14 100,10'
  }
])

const legendData = computed(() => [
  { label: 'Ganhos', val: '64%', color: '#d7b16f' },
  { label: 'Em aberto', val: '22%', color: '#4caf50' },
  { label: 'Perdidos', val: '14%', color: 'rgba(215, 177, 111, 0.2)' }
])

const quickActions = computed(() => [
  { title: 'Novo Cliente', sub: 'Registro rápido e seguro', icon: 'mdi-account-plus', route: '/clientes/novo', color: 'primary' },
  { 
    title: isImobiliaria.value ? 'Nova Reserva' : 'Novo Negócio', 
    sub: 'Expandir seu pipeline', 
    icon: 'mdi-lightning-bolt', 
    route: isImobiliaria.value ? '/vendas/reservas' : '/negocios/novo',
    color: 'success'
  },
  { title: 'Gerar Relatório', sub: 'Extrair insights agora', icon: 'mdi-file-chart', route: '/', color: 'info' }
])

const recentActivities = [
  { user: 'Ricardo Santos', time: '14 min atrás', text: 'Adicionou um novo cliente: Construtora Alpha', color: 'primary' },
  { user: 'Sistemas', time: '1 h atrás', text: 'Respaldo automático de banco de dados concluído', color: 'success' },
  { user: 'Maria Luíza', time: '3 h atrás', text: 'Alterou o status do negócio #432 para "Ganhado"', color: 'info' },
  { user: 'Arthur Lima', time: 'Ontem', text: 'Iniciou nova campanha de marketing para Leads', color: 'warning' }
]

onMounted(async () => {
  try {
    await modulesStore.fetchConfig()
    await Promise.allSettled([
      clientesStore.carregarClientes(),
      produtosStore.carregarProdutos(),
      negociosStore.carregarNegocios(),
      imoveisStore.fetchEmpreendimentos(),
      vendasStore.fetchReservas(),
    ])
  } catch (error) {
    console.error('Erro ao inicializar dashboard:', error)
  }
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100%;
}

.date-top {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #d7b16f;
  font-weight: 700;
  margin-bottom: 0.4rem;
  display: block;
}

.welcome-text {
  font-family: 'Manrope', sans-serif !important;
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 0;
  color: #f0e6d2;
  margin-bottom: 0.1rem;
  line-height: 1.1;
}

.subtitle {
  color: #b7aa8f;
  font-size: 1.1rem;
}



/* Metric Cards */
.metric-card {
  background: linear-gradient(145deg, #151822 0%, #0d0f16 100%);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(215, 177, 111, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.metric-card:hover {
  transform: translateY(-5px);
  border-color: rgba(215, 177, 111, 0.35);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
}

.metric-top {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.metric-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #b7aa8f;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
}

.metric-val-row {
  display: flex;
  align-items: baseline;
}

.metric-value {
  font-size: 2rem;
  font-weight: 800;
  color: #f0e6d2;
}

.spark-svg {
  width: 100%;
  height: 30px;
  opacity: 0.5;
}

/* Glass Cards */
.glass-card {
  background: rgba(21, 24, 34, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(215, 177, 111, 0.1);
  border-radius: 24px;
  padding: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-title {
  font-family: 'Manrope', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #f0e6d2;
}

.card-subtitle {
  font-size: 0.9rem;
  color: #b7aa8f;
}

.main-chart-svg {
  width: 100%;
  height: 300px;
}

.chart-label {
  font-size: 0.8rem;
  color: #9d957f;
}

.period-toggle {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.tiny-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #9d957f;
  display: block;
}

.bold-val {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f0e6d2;
}

/* Donut Chart */
.donut-wrap {
  position: relative;
}

.donut-svg {
  width: 180px;
  height: 180px;
  transform: rotate(-90deg);
}

.donut-text {
  transform: rotate(90deg);
  transform-origin: center;
  font-size: 20px;
  font-weight: 800;
}

.donut-sub {
  transform: rotate(90deg);
  transform-origin: center;
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.legend-name {
  font-size: 0.9rem;
  color: #b7aa8f;
}

.legend-val {
  float: right;
  font-weight: 700;
  color: #f0e6d2;
  margin-left: 12px;
}

/* Priority Actions */
.priority-action-item {
  transition: all 0.2s;
}

.priority-action-item:hover {
  transform: translateX(5px);
}

/* Timeline */
.text-premium {
  color: #d7b16f;
}

.text-soft {
  color: #b7aa8f;
}

.full-h {
  height: 100%;
}

.promo-card {
  background: linear-gradient(135deg, rgba(215, 177, 111, 0.08) 0%, rgba(13, 15, 22, 0) 100%);
  border: 1px dashed rgba(215, 177, 111, 0.25);
}

.premium-title {
  font-family: 'Manrope', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #f0e6d2;
}

.premium-btn {
  font-weight: 700;
  padding: 0 2rem;
}

@media (max-width: 960px) {
  .welcome-text {
    font-size: 1.8rem;
  }
}
</style>
