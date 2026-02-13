<template>
  <v-container fluid class="page">
    <div class="page-header">
      <div>
        <h2>Produtos</h2>
        <p class="subtitle">Gerencie seus produtos cadastrados</p>
      </div>
      <div class="header-actions">
        <v-text-field
          v-model="search"
          label="Pesquisar"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          variant="outlined"
          class="search-field"
        />
        <ColumnManagerMenu
          v-model="visibleColumns"
          :columns="columns"
          @reset="resetColumns"
          @select-all="selectAllColumns"
        />
        <v-btn color="primary" to="/produtos/novo">+ Novo Produto</v-btn>
      </div>
    </div>

    <v-card elevation="2" class="table-card">
      <v-card-text>
        <div v-if="mobile && filteredProdutos.length > 0" class="mobile-list">
          <v-card
            v-for="produto in filteredProdutos"
            :key="produto.id"
            class="mobile-item"
            elevation="1"
            @click="irParaProduto(produto.id)"
          >
            <div class="mobile-item-head">
              <div>
                <p class="mobile-code">#{{ produto.codigo !== undefined && produto.codigo !== null ? String(produto.codigo).padStart(3, '0') : '---' }}</p>
                <h3 class="mobile-name">{{ produto.nome }}</h3>
              </div>
              <v-chip :color="produto.isActive ? 'blue' : 'grey-lighten-2'" size="small" variant="flat">
                {{ produto.isActive ? 'Ativo' : 'Inativo' }}
              </v-chip>
            </div>
            <p class="mobile-meta">Qtd: {{ produto.quantidade }}</p>
            <p class="mobile-meta">R$ {{ Number.isFinite(Number(produto.valorUnitario)) ? Number(produto.valorUnitario).toFixed(2) : '0.00' }}</p>
            <div class="mobile-actions">
              <v-btn size="small" variant="tonal" color="primary" @click.stop="irParaEdicao(produto.id)">Editar</v-btn>
              <v-btn size="small" variant="tonal" :color="produto.isActive ? 'warning' : 'success'" @click.stop="abrirConfirmacaoStatus(produto.id, produto.isActive)">
                {{ produto.isActive ? 'Inativar' : 'Ativar' }}
              </v-btn>
              <v-btn size="small" variant="tonal" color="error" @click.stop="abrirConfirmacaoExcluir(produto.id)">Excluir</v-btn>
            </div>
          </v-card>
        </div>

        <v-table v-else class="table">
          <thead>
            <tr>
              <th v-if="isColumnVisible('codigo')">Código</th>
              <th v-if="isColumnVisible('nome')">Nome</th>
              <th v-if="isColumnVisible('descricao')">Descrição</th>
              <th v-if="isColumnVisible('categoria')">Categoria</th>
              <th v-if="isColumnVisible('quantidade')">Quantidade</th>
              <th v-if="isColumnVisible('valorUnitario')">Valor Unitário</th>
              <th v-if="isColumnVisible('status')">Status</th>
              <th v-if="isColumnVisible('acoes')">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="produto in filteredProdutos"
              :key="produto.id"
              class="clickable-row"
              role="button"
              tabindex="0"
              @click="irParaProduto(produto.id)"
              @keydown.enter.prevent="irParaProduto(produto.id)"
              @keydown.space.prevent="irParaProduto(produto.id)"
            >
              <td v-if="isColumnVisible('codigo')">#{{ produto.codigo !== undefined && produto.codigo !== null ? String(produto.codigo).padStart(3, '0') : '---' }}</td>
              <td v-if="isColumnVisible('nome')">{{ produto.nome }}</td>
              <td v-if="isColumnVisible('descricao')">{{ produto.descricao || '-' }}</td>
              <td v-if="isColumnVisible('categoria')">{{ produto.categoria || '-' }}</td>
              <td v-if="isColumnVisible('quantidade')">{{ produto.quantidade }}</td>
              <td v-if="isColumnVisible('valorUnitario')">
                R$ {{ Number.isFinite(Number(produto.valorUnitario)) ? Number(produto.valorUnitario).toFixed(2) : '0.00' }}
              </td>
              <td v-if="isColumnVisible('status')">
                <v-chip :color="produto.isActive ? 'blue' : 'grey-lighten-2'" size="small" variant="flat">
                  {{ produto.isActive ? 'Ativo' : 'Inativo' }}
                </v-chip>
              </td>
              <td v-if="isColumnVisible('acoes')">
                <v-menu>
                  <template #activator="{ props }">
                    <v-btn icon variant="text" size="small" v-bind="props" @click.stop>
                      <v-icon icon="mdi-dots-vertical" />
                    </v-btn>
                  </template>
                  <v-list density="compact">
                    <v-list-item title="Editar" @click.stop="irParaEdicao(produto.id)" />
                    <v-list-item :title="produto.isActive ? 'Inativar' : 'Ativar'" @click.stop="abrirConfirmacaoStatus(produto.id, produto.isActive)" />
                    <v-list-item title="Excluir" @click.stop="abrirConfirmacaoExcluir(produto.id)" />
                  </v-list>
                </v-menu>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div v-if="filteredProdutos.length === 0" class="empty-state">
          <p>Nenhum produto encontrado</p>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="confirmarExcluir" max-width="440">
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon icon="delete" color="error" />
          Confirmar exclusão
        </v-card-title>
        <v-card-text>Tem certeza que deseja excluir este produto? Essa ação não poderá ser desfeita.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="tonal" color="grey" @click="confirmarExcluir = false">Cancelar</v-btn>
          <v-btn color="error" @click="confirmarExclusao">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmarStatus" max-width="440">
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon :icon="statusAtual ? 'toggle_off' : 'toggle_on'" color="primary" />
          {{ statusAtual ? 'Inativar produto' : 'Ativar produto' }}
        </v-card-title>
        <v-card-text>
          {{ statusAtual ? 'Deseja inativar este produto?' : 'Deseja ativar este produto?' }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="tonal" color="grey" @click="confirmarStatus = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmarAlterarStatus">
            {{ statusAtual ? 'Inativar' : 'Ativar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useProdutosStore } from '../../stores/produtosStore'
import ColumnManagerMenu from '../../components/common/ColumnManagerMenu.vue'
import { useColumnManager } from '../../composables/useColumnManager'

const router = useRouter()
const { mobile } = useDisplay()
const { produtos, carregarProdutos, deletarProduto, atualizarProduto } = useProdutosStore()
const search = ref('')

const {
  columns,
  visibleColumns,
  isColumnVisible,
  selectAllColumns,
  resetColumns,
} = useColumnManager('crm.columns.produtos', [
  { key: 'codigo', label: 'Código' },
  { key: 'nome', label: 'Nome' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'categoria', label: 'Categoria', defaultVisible: false },
  { key: 'quantidade', label: 'Quantidade' },
  { key: 'valorUnitario', label: 'Valor Unitário' },
  { key: 'status', label: 'Status' },
  { key: 'acoes', label: 'Ações', locked: true },
])

const filteredProdutos = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return produtos.value

  return produtos.value.filter((produto) => {
    const text = [produto.codigo, produto.nome, produto.descricao, produto.categoria, produto.quantidade, produto.valorUnitario]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return text.includes(term)
  })
})

const confirmarExcluir = ref(false)
const confirmarStatus = ref(false)
const produtoSelecionado = ref<string | null>(null)
const statusAtual = ref<boolean>(true)

const irParaProduto = (id: string) => {
  router.push(`/produtos/${id}`)
}

const irParaEdicao = (id: string) => {
  router.push(`/produtos/${id}/editar`)
}

const abrirConfirmacaoExcluir = (id: string) => {
  produtoSelecionado.value = id
  confirmarExcluir.value = true
}

const confirmarExclusao = async () => {
  if (produtoSelecionado.value) {
    await deletarProduto(produtoSelecionado.value)
  }
  confirmarExcluir.value = false
}

const abrirConfirmacaoStatus = (id: string, isActive?: boolean) => {
  produtoSelecionado.value = id
  statusAtual.value = Boolean(isActive)
  confirmarStatus.value = true
}

const confirmarAlterarStatus = async () => {
  if (produtoSelecionado.value) {
    await atualizarProduto(produtoSelecionado.value, { isActive: !statusAtual.value })
  }
  confirmarStatus.value = false
}

onMounted(() => {
  carregarProdutos()
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
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.search-field {
  width: 240px;
}

.page-header h2 {
  margin: 0;
  color: #111827;
}

.subtitle {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.table-card {
  border-radius: 16px;
}

.mobile-list {
  display: grid;
  gap: 0.7rem;
}

.mobile-item {
  border-radius: 14px;
  padding: 0.85rem;
  border: 1px solid #d7e3f5;
}

.mobile-item-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.6rem;
}

.mobile-code {
  margin: 0;
  font-size: 0.75rem;
  color: #667a96;
}

.mobile-name {
  margin: 0.15rem 0 0;
  font-size: 1.04rem;
  color: #173a66;
  line-height: 1.2;
}

.mobile-meta {
  margin: 0.32rem 0 0;
  color: #4e6482;
  font-size: 0.87rem;
}

.mobile-actions {
  display: flex;
  gap: 0.45rem;
  margin-top: 0.8rem;
  flex-wrap: wrap;
}

.clickable-row {
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
  }

  .search-field {
    width: 100% !important;
  }

  .header-actions .v-btn {
    width: 100%;
  }
}
</style>
