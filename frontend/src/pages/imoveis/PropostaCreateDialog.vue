<template>
  <v-dialog v-model="dialog" max-width="600px">
    <template v-slot:activator="{ props }">
      <v-btn
        color="primary"
        size="x-small"
        v-bind="props"
        prepend-icon="mdi-file-edit-outline"
        class="ml-1"
      >
        Proposta
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="bg-primary text-white pa-4">
        Nova Proposta - Unidade {{ unidade.codigoInterno }}
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form @submit.prevent="salvar">
          <v-autocomplete
            v-model="form.clienteId"
            :items="clientOptions"
            item-title="nome"
            item-value="id"
            label="Selecione o Cliente"
            placeholder="Comece a digitar o nome"
            variant="outlined"
            class="mb-2"
          ></v-autocomplete>

          <v-text-field
            v-model="form.valorProposto"
            label="Valor da Proposta (R$)"
            type="number"
            step="0.01"
            variant="outlined"
            prepend-inner-icon="mdi-currency-brl"
          ></v-text-field>

          <v-textarea
            v-model="form.condicoesPagamento"
            label="Condições de Pagamento"
            placeholder="Ex: 20% entrada + saldo em 60x"
            variant="outlined"
            rows="4"
          ></v-textarea>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
        <v-btn color="primary" @click="salvar" :loading="vendasStore.loading">Enviar Proposta</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useVendasStore } from '../../stores/vendasStore'
import { useClientesStore } from '../../stores/clientesStore'

const props = defineProps<{ unidade: any }>()
const emit = defineEmits(['success'])

const vendasStore = useVendasStore()
const clientesStore = useClientesStore()
const dialog = ref(false)
const clientOptions = computed<any[]>(() => {
  const raw: any = clientesStore.clientes as any
  return Array.isArray(raw) ? raw : (raw?.value ?? [])
})

const form = ref({
  unidadeId: props.unidade.id,
  clienteId: '',
  valorProposto: props.unidade.valorOferta || props.unidade.valorTabela || 0,
  condicoesPagamento: '',
  status: 'ENVIADA'
})

const salvar = async () => {
    if(!form.value.clienteId) {
        alert('Selecione um cliente')
        return
    }
    const res = await vendasStore.createProposta(form.value)
    if(res.success) {
        dialog.value = false
        emit('success')
    } else {
        alert('Erro ao criar proposta')
    }
}
</script>
