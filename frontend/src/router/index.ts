import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useModulesStore } from '@/stores/modulesStore'
import MainLayout from '../layouts/MainLayout.vue'

// Pages
import HomePage from '../pages/HomePage.vue'
import ClientesList from '../pages/clientes/ClientesList.vue'
import ClientesCreate from '../pages/clientes/ClientesCreate.vue'
import ClientesShow from '../pages/clientes/ClientesShow.vue'
import ClientesEdit from '../pages/clientes/ClientesEdit.vue'
import ProdutosList from '../pages/produtos/ProdutosList.vue'
import ProdutosCreate from '../pages/produtos/ProdutosCreate.vue'
import ProdutosShow from '../pages/produtos/ProdutosShow.vue'
import ProdutosEdit from '../pages/produtos/ProdutosEdit.vue'
import NegociosList from '../pages/negocios/NegociosList.vue'
import NegociosCreate from '../pages/negocios/NegociosCreate.vue'
import NegociosShow from '../pages/negocios/NegociosShow.vue'
import NegociosEdit from '../pages/negocios/NegociosEdit.vue'
import ConfigurarPage from '../pages/ConfigurarPage.vue'
import ImoveisList from '../pages/imoveis/ImoveisList.vue'
import ImoveisCreate from '../pages/imoveis/ImoveisCreate.vue'
import ImoveisShow from '../pages/imoveis/ImoveisShow.vue'
import LeadsKanban from '../pages/leads/LeadsKanban.vue'
import ReservasList from '../pages/vendas/ReservasList.vue'

// (continued imports)
import Login from '../views/Login.vue'
import ContasPagar from '../views/Financeiro/ContasPagar.vue'
import ContasReceber from '../views/Financeiro/ContasReceber.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true },
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: HomePage,
      },
      {
        path: 'leads',
        name: 'Leads',
        component: LeadsKanban,
        meta: { title: 'Leads' }
      },
      {
        path: 'financeiro',
        children: [
          {
            path: 'pagar',
            name: 'Contas a Pagar',
            component: ContasPagar,
            meta: { title: 'Contas a Pagar' }
          },
          {
            path: 'receber',
            name: 'Contas a Receber',
            component: ContasReceber,
            meta: { title: 'Contas a Receber' }
          }
        ]
      },
      {
        path: 'clientes',
        children: [
          {
            path: '',
            name: 'Clientes',
            component: ClientesList,
            meta: { title: 'Clientes' }
          },
          {
            path: 'novo',
            name: 'Novo Cliente',
            component: ClientesCreate,
            meta: { title: 'Novo Cliente' }
          },
          {
            path: ':id/editar',
            name: 'Editar Cliente',
            component: ClientesEdit,
            meta: { title: 'Editar Cliente' }
          },
          {
            path: ':id',
            name: 'Detalhes do Cliente',
            component: ClientesShow,
            meta: { title: 'Detalhes do Cliente' }
          },
        ],
      },
      {
        path: 'imoveis',
        children: [
          {
            path: '',
            name: 'Empreendimentos',
            component: ImoveisList,
            meta: { title: 'Empreendimentos' }
          },
          {
            path: 'novo',
            name: 'Novo Empreendimento',
            component: ImoveisCreate,
            meta: { title: 'Novo Empreendimento' }
          },
          {
            path: ':id/unidades',
            name: 'Unidades do Empreendimento',
            component: ImoveisShow,
            meta: { title: 'Unidades' }
          },
          {
            path: ':id/editar',
            name: 'Editar Empreendimento',
            component: () => import('../pages/imoveis/ImoveisEdit.vue'),
            meta: { title: 'Editar Empreendimento' }
          },
          {
            path: ':id',
            redirect: to => `/imoveis/${to.params.id}/unidades`
          }
        ],
      },
      {
        path: 'produtos',
        children: [
          {
            path: '',
            name: 'Produtos',
            component: ProdutosList,
            meta: { title: 'Produtos' }
          },
          {
            path: 'novo',
            name: 'Novo Produto',
            component: ProdutosCreate,
            meta: { title: 'Novo Produto' }
          },
          {
            path: ':id/editar',
            name: 'Editar Produto',
            component: ProdutosEdit,
            meta: { title: 'Editar Produto' }
          },
          {
            path: ':id',
            name: 'Detalhes do Produto',
            component: ProdutosShow,
            meta: { title: 'Detalhes do Produto' }
          },
        ],
      },
      {
        path: 'vendas',
        children: [
          {
            path: 'reservas',
            name: 'Reservas',
            component: ReservasList,
            meta: { title: 'Reservas' }
          }
        ]
      },
      {
        path: 'negocios',
        children: [
          {
            path: '',
            name: 'Negócios',
            component: NegociosList,
            meta: { title: 'Negócios' }
          },
          {
            path: 'novo',
            name: 'Novo Negócio',
            component: NegociosCreate,
            meta: { title: 'Novo Negócio' }
          },
          {
            path: ':id/editar',
            name: 'Editar Negócio',
            component: NegociosEdit,
            meta: { title: 'Editar Negócio' }
          },
          {
            path: ':id',
            name: 'Detalhes do Negócio',
            component: NegociosShow,
            meta: { title: 'Detalhes do Negócio' }
          },
        ],
      },
      {
        path: 'configurar',
        name: 'Configurações',
        component: ConfigurarPage,
        meta: { title: 'Configurações' }
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const modulesStore = useModulesStore()
  if (!to.meta.public && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  if (!to.meta.public && authStore.isAuthenticated) {
    if (!modulesStore.loaded) {
      await modulesStore.fetchConfig()
    }

    const path = to.path
    const blocked =
      (path.startsWith('/leads') && !modulesStore.enabledModules.leads) ||
      (path.startsWith('/produtos') && !modulesStore.enabledModules.produtos) ||
      (path.startsWith('/imoveis') && !modulesStore.enabledModules.imoveis) ||
      (path.startsWith('/vendas/reservas') && !modulesStore.enabledModules.reservas) ||
      (path.startsWith('/negocios') && !modulesStore.enabledModules.negocios) ||
      (path.startsWith('/financeiro/pagar') && !modulesStore.enabledModules.contasPagar) ||
      (path.startsWith('/financeiro/receber') && !modulesStore.enabledModules.contasReceber)

    if (blocked) {
      next('/')
      return
    }
    
    next()
  } else {
    next()
  }
})

export default router
