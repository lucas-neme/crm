import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
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
        name: 'LeadsKanban',
        component: LeadsKanban,
      },
      {
        path: 'financeiro',
        children: [
          {
            path: 'pagar',
            name: 'ContasPagar',
            component: ContasPagar
          },
          {
            path: 'receber',
            name: 'ContasReceber',
            component: ContasReceber
          }
        ]
      },
      {
        path: 'clientes',
        children: [
          {
            path: '',
            name: 'ClientesList',
            component: ClientesList,
          },
          {
            path: 'novo',
            name: 'ClientesCreate',
            component: ClientesCreate,
          },
          {
            path: ':id/editar',
            name: 'ClientesEdit',
            component: ClientesEdit,
          },
          {
            path: ':id',
            name: 'ClientesShow',
            component: ClientesShow,
          },
        ],
      },
      {
        path: 'imoveis',
        children: [
          {
            path: '',
            name: 'EmpreendimentosList',
            component: ImoveisList,
          },
          {
            path: 'novo',
            name: 'EmpreendimentosCreate',
            component: ImoveisCreate,
          },
          {
            path: ':id/unidades',
            name: 'EmpreendimentosShow',
            component: ImoveisShow,
          },
          {
            path: ':id/editar',
            name: 'EmpreendimentosEdit',
            component: () => import('../pages/imoveis/ImoveisEdit.vue'),
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
            name: 'ProdutosList',
            component: ProdutosList,
          },
          {
            path: 'novo',
            name: 'ProdutosCreate',
            component: ProdutosCreate,
          },
          {
            path: ':id/editar',
            name: 'ProdutosEdit',
            component: ProdutosEdit,
          },
          {
            path: ':id',
            name: 'ProdutosShow',
            component: ProdutosShow,
          },
        ],
      },
      {
        path: 'vendas',
        children: [
          {
            path: 'reservas',
            name: 'ReservasList',
            component: ReservasList,
          }
        ]
      },
      {
        path: 'negocios',
        children: [
          {
            path: '',
            name: 'NegociosList',
            component: NegociosList,
          },
          {
            path: 'novo',
            name: 'NegociosCreate',
            component: NegociosCreate,
          },
          {
            path: ':id/editar',
            name: 'NegociosEdit',
            component: NegociosEdit,
          },
          {
            path: ':id',
            name: 'NegociosShow',
            component: NegociosShow,
          },
        ],
      },
      {
        path: 'configurar',
        name: 'Configurar',
        component: ConfigurarPage,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (!to.meta.public && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
