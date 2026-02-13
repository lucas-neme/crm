<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template v-slot:activator="{ props }">
      <v-btn
        v-if="unidade.statusUnidade === 'DISPONIVEL'"
        color="warning"
        size="x-small"
        v-bind="props"
        prepend-icon="mdi-calendar-check"
      >
        Reservar
      </v-btn>
    </template>

    <v-card>
      <v-card-title class="bg-warning text-white pa-4">
        Reservar Unidade {{ unidade.codigoInterno }}
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form @submit.prevent="salvar">
          <v-autocomplete
            v-model="form.clienteId"
            :items="clientOptions"
            item-title="nome"
            item-value="id"
            label="Selecione o Cliente (Lead)"
            placeholder="Comece a digitar o nome"
            required
            variant="outlined"
            class="mb-2"
          ></v-autocomplete>

          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="form.dataInicio"
                label="Data Início"
                type="date"
                required
                variant="outlined"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="form.dataFim"
                label="Data Vencimento"
                type="date"
                required
                variant="outlined"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-textarea
            v-model="form.observacoes"
            label="Observações da Reserva"
            variant="outlined"
            rows="2"
          ></v-textarea>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
        <v-btn color="warning" @click="salvar" :loading="store.loading">Confirmar Reserva</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useVendasStore } from '../../stores/vendasStore'
import { useClientesStore } from '../../stores/clientesStore'

const props = defineProps<{ unidade: any }>()
const emit = defineEmits(['success'])

const store = useVendasStore()
const clientesStore = useClientesStore()
const dialog = ref(false)

const form = ref({
  unidadeId: props.unidade.id,
  clienteId: '',
  dataInicio: new Date().toISOString().split('T')[0],
  dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias padrão
  observacoes: ''
})

const clientOptions = computed<any[]>(() => {
  const raw: any = clientesStore.clientes as any
  return Array.isArray(raw) ? raw : (raw?.value ?? [])
})

const salvar = async () => {
  if (!form.value.clienteId) {
    alert('Por favor, selecione um cliente')
    return
  }

  const res = await store.createReserva(form.value)
  if (res.success) {
    dialog.value = false
    emit('success')
  } else {
    alert(res.message)
  }
}

onMounted(() => {
  clientesStore.carregarClientes()
})
</script>
