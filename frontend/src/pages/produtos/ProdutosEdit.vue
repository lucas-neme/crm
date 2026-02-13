<template>
  <v-container fluid class="page">
    <v-card elevation="2" class="form-card">
      <v-card-title>Editar Produto</v-card-title>
      <v-card-text>
        <v-progress-linear v-if="carregando" indeterminate class="mb-4" />
        <v-form v-else @submit.prevent="salvarProduto">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.nome" label="Nome" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.quantidade" label="Quantidade" type="number" min="0" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model.number="form.valorUnitario" label="Valor Unitário (R$)" type="number" min="0" step="0.01" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch v-model="form.isActive" label="Produto Ativo" color="primary" hide-details />
            </v-col>
          </v-row>

          <div class="form-actions">
            <v-btn color="primary" type="submit">Salvar</v-btn>
            <v-btn variant="tonal" to="/produtos">Cancelar</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <v-dialog v-model="confirmarSalvar" max-width="440">
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon icon="edit" color="primary" />
          Confirmar edição
        </v-card-title>
        <v-card-text>Deseja salvar as alterações deste produto?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="tonal" color="grey" @click="confirmarSalvar = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmarSalvarEdicao">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProdutosStore } from '../../stores/produtosStore'

const router = useRouter()
const route = useRoute()
const { obterProduto, atualizarProduto, carregarProdutos } = useProdutosStore()

const produtoId = route.params.id as string
const carregando = ref(true)
const confirmarSalvar = ref(false)

const form = ref({
  nome: '',
  quantidade: 0,
  valorUnitario: 0,
  isActive: true,
})

const carregarProduto = async () => {
  let produto = obterProduto(produtoId)
  if (!produto) {
    await carregarProdutos()
    produto = obterProduto(produtoId)
  }

  if (!produto) {
    alert('Produto não encontrado.')
    router.push('/produtos')
    return
  }

  form.value = {
    nome: produto.nome || '',
    quantidade: Number(produto.quantidade) || 0,
    valorUnitario: Number(produto.valorUnitario) || 0,
    isActive: produto.isActive !== undefined ? produto.isActive : true,
  }
  carregando.value = false
}

const salvarProduto = () => {
  confirmarSalvar.value = true
}

const confirmarSalvarEdicao = async () => {
  try {
    await atualizarProduto(produtoId, form.value)
    confirmarSalvar.value = false
    router.push(`/produtos/${produtoId}`)
  } catch (error) {
    alert('Erro ao salvar produto. Verifique se o backend está rodando.')
  }
}

onMounted(() => {
  carregarProduto()
})
</script>

<style scoped>
.page {
  padding: 0;
}

.form-card {
  border-radius: 16px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
