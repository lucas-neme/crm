<template>
  <nav v-if="items.length" class="breadcrumbs" aria-label="Breadcrumb">
    <RouterLink class="crumb home" to="/">
      <v-icon icon="mdi-home" size="16" />
      <span>Home</span>
    </RouterLink>

    <template v-for="(item, index) in items" :key="`${item.title}-${index}`">
      <v-icon icon="mdi-chevron-right" size="16" class="divider" />
      <RouterLink v-if="item.to" class="crumb" :to="item.to">{{ item.title }}</RouterLink>
      <span v-else class="crumb current">{{ item.title }}</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const routeMap: Record<string, Array<{ title: string; to?: string }>> = {
  Home: [],
  LeadsKanban: [{ title: 'Leads' }],
  ContasPagar: [{ title: 'Financeiro', to: '/financeiro/pagar' }, { title: 'Contas a Pagar' }],
  ContasReceber: [{ title: 'Financeiro', to: '/financeiro/receber' }, { title: 'Contas a Receber' }],
  ClientesList: [{ title: 'Clientes' }],
  ClientesCreate: [{ title: 'Clientes', to: '/clientes' }, { title: 'Novo Cliente' }],
  ClientesEdit: [{ title: 'Clientes', to: '/clientes' }, { title: 'Editar Cliente' }],
  ClientesShow: [{ title: 'Clientes', to: '/clientes' }, { title: 'Detalhes' }],
  EmpreendimentosList: [{ title: 'Empreendimentos' }],
  EmpreendimentosCreate: [{ title: 'Empreendimentos', to: '/imoveis' }, { title: 'Novo Empreendimento' }],
  EmpreendimentosShow: [{ title: 'Empreendimentos', to: '/imoveis' }, { title: 'Unidades' }],
  ReservasList: [{ title: 'Reservas' }],
  ProdutosList: [{ title: 'Produtos' }],
  ProdutosCreate: [{ title: 'Produtos', to: '/produtos' }, { title: 'Novo Produto' }],
  ProdutosEdit: [{ title: 'Produtos', to: '/produtos' }, { title: 'Editar Produto' }],
  ProdutosShow: [{ title: 'Produtos', to: '/produtos' }, { title: 'Detalhes' }],
  NegociosList: [{ title: 'Negócios' }],
  NegociosCreate: [{ title: 'Negócios', to: '/negocios' }, { title: 'Novo Negócio' }],
  NegociosEdit: [{ title: 'Negócios', to: '/negocios' }, { title: 'Editar Negócio' }],
  NegociosShow: [{ title: 'Negócios', to: '/negocios' }, { title: 'Detalhes' }],
  Configurar: [{ title: 'Configurações' }],
}

const items = computed(() => routeMap[route.name as string] || [])
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  padding: 0;
  margin: 0;
  min-height: 34px;
}

.crumb {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  text-decoration: none;
  color: #3b4d66;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(151, 173, 203, 0.45);
}

.crumb:hover {
  background: rgba(220, 234, 255, 0.9);
  color: #163258;
}

.crumb.current {
  background: linear-gradient(135deg, #1f65bf 0%, #1b4f94 100%);
  border-color: transparent;
  color: #fff;
}

.crumb.home {
  background: rgba(212, 225, 245, 0.6);
}

.divider {
  color: #7b8ea8;
}
</style>
