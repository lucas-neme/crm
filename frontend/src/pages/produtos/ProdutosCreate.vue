<template>
  <v-container fluid class="page">
    <v-card elevation="2" class="form-card">
      <v-card-title>Novo Produto</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="salvarProduto">
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
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProdutosStore } from '../../stores/produtosStore'

const router = useRouter()
const { adicionarProduto } = useProdutosStore()

const form = ref({
  nome: '',
  quantidade: 0,
  valorUnitario: 0,
  isActive: true,
})

const salvarProduto = async () => {
  try {
    console.log('Produto criado:', form.value)
    await adicionarProduto(form.value)
    router.push('/produtos')
  } catch (error) {
    alert('Erro ao salvar produto. Verifique se o backend está rodando.')
  }
}
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
