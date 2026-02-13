<template>
  <v-container fluid class="page">
    <h2 class="page-title">Editar Empreendimento</h2>
    <v-card class="mt-4 pa-4">
      <v-form @submit.prevent="salvar">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.nome" label="Nome do Empreendimento" required></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-select 
              v-model="form.status" 
              :items="[{title: 'LANÇAMENTO', value: 'LANCAMENTO'}, {title: 'EM OBRAS', value: 'EM_OBRAS'}, {title: 'PRONTO', value: 'PRONTO'}, {title: 'ESGOTADO', value: 'ESGOTADO'}]" 
              item-title="title"
              item-value="value"
              label="Status"
            ></v-select>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="form.previsaoEntrega" label="Previsão de Entrega" type="date"></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-file-input label="Imagem de Capa (Em breve)" disabled></v-file-input>
          </v-col>

          <v-col cols="12">
            <h3>Endereço</h3>
            <v-divider class="mb-2"></v-divider>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="form.enderecoCep" label="CEP" @blur="buscarCep"></v-text-field>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field v-model="form.enderecoLogradouro" label="Logradouro"></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
             <v-text-field v-model="form.enderecoNumero" label="Número"></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
             <v-text-field v-model="form.enderecoBairro" label="Bairro"></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
             <v-text-field v-model="form.enderecoCidade" label="Cidade"></v-text-field>
          </v-col>
                    
          <v-col cols="12">
             <v-textarea v-model="form.descricaoCurta" label="Descrição Curta"></v-textarea>
          </v-col>
        </v-row>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn :to="`/imoveis/${route.params.id}`" variant="text">Cancelar</v-btn>
          <v-btn color="primary" type="submit" :loading="loading">Atualizar Empreendimento</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useImoveisStore } from '../../stores/imoveisStore'

const router = useRouter()
const route = useRoute()
const store = useImoveisStore()

const loading = ref(false)
const form = ref({
  nome: '',
  status: 'LANCAMENTO',
  previsaoEntrega: '',
  descricaoCurta: '',
  enderecoCep: '',
  enderecoLogradouro: '',
  enderecoNumero: '',
  enderecoBairro: '',
  enderecoCidade: '',
  enderecoUf: '',
})

const buscarCep = async () => {
  if (form.value.enderecoCep.length >= 8) {
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${form.value.enderecoCep}/json/`)
      const data = await resp.json()
      if (!data.erro) {
        form.value.enderecoLogradouro = data.logradouro
        form.value.enderecoBairro = data.bairro
        form.value.enderecoCidade = data.localidade
        form.value.enderecoUf = data.uf
      }
    } catch {}
  }
}

const salvar = async () => {
  loading.value = true
  const id = route.params.id as string
  const res = await store.updateEmpreendimento(id, form.value)
  if (res.success) {
    router.push(`/imoveis/${id}`)
  } else {
    alert(res.message)
  }
  loading.value = false
}

onMounted(async () => {
    const id = route.params.id as string
    loading.value = true
    await store.fetchEmpreendimento(id)
    loading.value = false
    
    if (store.currentEmpreendimento) {
        const emp = store.currentEmpreendimento
        form.value = {
            nome: emp.nome,
            status: emp.status,
            previsaoEntrega: emp.previsaoEntrega?.split('T')[0] || '',
            descricaoCurta: emp.descricaoCurta || '',
            enderecoCep: emp.enderecoCep || '',
            enderecoLogradouro: emp.enderecoLogradouro || '',
            enderecoNumero: emp.enderecoNumero || '',
            enderecoBairro: emp.enderecoBairro || '',
            enderecoCidade: emp.enderecoCidade || '',
            enderecoUf: emp.enderecoUf || '',
        }
    }
})
</script>

<style scoped>
.page {
  padding: 0;
}

.page-title {
  margin: 0 0 1.5rem;
  color: #111827;
}
</style>
