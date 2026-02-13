<template>
  <v-container fluid class="page">
    <div class="page-header">
      <v-btn variant="tonal" to="/produtos">← Voltar</v-btn>
      <div class="page-actions">
        <v-btn color="primary" variant="tonal" :to="`/produtos/${produtoId}/editar`">Editar</v-btn>
        <v-btn color="error" variant="tonal" @click="abrirConfirmacaoExcluir">Excluir</v-btn>
      </div>
    </div>

    <v-card elevation="2" class="detail-card">
      <v-card-title>
        <div class="title-row">
          <div>
            <h2>{{ produto.nome }}</h2>
            <p class="subtitle">Código #{{ String(produto.codigo ?? 0).padStart(3, '0') }}</p>
          </div>
          <v-chip :color="produto.isActive ? 'blue' : 'grey-lighten-2'" variant="flat">
            {{ produto.isActive ? 'Ativo' : 'Inativo' }}
          </v-chip>
        </div>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <v-list density="comfortable">
              <v-list-item title="Descrição" :subtitle="produto.descricao || 'Não informado'" />
              <v-list-item title="Quantidade em Estoque" :subtitle="`${produto.quantidade} unidades`" />
            </v-list>
          </v-col>
          <v-col cols="12" md="6">
            <v-list density="comfortable">
              <v-list-item title="Valor Unitário" :subtitle="`R$ ${Number(produto.valorUnitario).toFixed(2)}`" />
              <v-list-item title="Valor Total" :subtitle="`R$ ${(Number(produto.quantidade) * Number(produto.valorUnitario)).toFixed(2)}`" />
              <v-list-item title="Categoria" :subtitle="produto.categoria || 'Não informado'" />
            </v-list>
          </v-col>
        </v-row>
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
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProdutosStore } from '../../stores/produtosStore'

const router = useRouter()
const route = useRoute()
const { obterProduto, deletarProduto } = useProdutosStore()

const produtoId = route.params.id as string
const confirmarExcluir = ref(false)
const produto = computed(() => {
  return obterProduto(produtoId) || {
    id: produtoId,
    codigo: 0,
    nome: 'Produto não encontrado',
    descricao: '',
    quantidade: 0,
    valorUnitario: 0,
    categoria: '',
  }
})

const abrirConfirmacaoExcluir = () => {
  confirmarExcluir.value = true
}

const confirmarExclusao = async () => {
  await deletarProduto(produtoId)
  confirmarExcluir.value = false
  router.push('/produtos')
}
</script>

<style scoped>
.page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.page-actions {
  display: flex;
  gap: 0.75rem;
}

.detail-card {
  border-radius: 16px;
}

.subtitle {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}
</style>
