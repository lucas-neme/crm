<template>
  <v-dialog v-model="visible" max-width="600px" persistent>
    <v-card>
      <v-card-title class="bg-warning text-white pa-4">
        Nova Reserva para {{ lead?.nome }}
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form ref="formRef" @submit.prevent="confirmar">
          <p class="text-body-2 mb-4 text-grey-darken-1">
            Selecione a unidade que deseja reservar para este lead.
          </p>

          <v-autocomplete
            v-model="form.unidadeId"
            :items="unidadeOptions"
            item-title="label"
            item-value="id"
            label="Selecione o Empreendimento / Unidade"
            placeholder="Escolha a unidade disponível"
            required
            :rules="[v => !!v || 'Unidade é obrigatória']"
            variant="outlined"
            class="mb-2"
            :loading="imoveisStore.loading"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:subtitle>
                   {{ item.raw.tipo }} - {{ formatPreco(item.raw.valor) }}
                </template>
              </v-list-item>
            </template>
          </v-autocomplete>

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
            hide-details
          ></v-textarea>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-btn variant="text" @click="cancelar">Cancelar</v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="warning"
          variant="flat"
          @click="confirmar"
          :loading="vendasStore.loading"
        >
          Confirmar Reserva
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useImoveisStore } from '../../stores/imoveisStore'
import { useVendasStore } from '../../stores/vendasStore'

const props = defineProps<{
  modelValue: boolean
  lead: any
}>()

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const imoveisStore = useImoveisStore()
const vendasStore = useVendasStore()
const formRef = ref<any>(null)

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const form = ref({
  unidadeId: '',
  clienteId: '',
  dataInicio: new Date().toISOString().split('T')[0],
  dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  observacoes: ''
})

watch(() => props.lead, (newLead) => {
  if (newLead) {
    form.value.clienteId = newLead.id
  }
}, { immediate: true })

const unidadeOptions = computed(() => {
  return imoveisStore.unidades
    .filter(u => u.statusUnidade === 'DISPONIVEL')
    .map(u => ({
      id: u.id,
      label: `${(u as any).Empreendimento?.nome || 'Empreendimento'} - Un. ${u.codigoInterno}`,
      valor: u.valorTabela,
      tipo: u.tipo
    }))
})

const formatPreco = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const cancelar = () => {
  visible.value = false
  emit('cancel')
}

const confirmar = async () => {
  const { valid } = await formRef.value?.validate() || { valid: true }
  if (!valid) return

  if (!form.value.unidadeId) return

  try {
    const res = await vendasStore.createReserva(form.value)
    if (res.success) {
      visible.value = false
      emit('confirm')
    } else {
      alert(res.message || 'Erro ao criar reserva')
    }
  } catch (error) {
    console.error(error)
    alert('Erro ao criar reserva')
  }
}

onMounted(() => {
  imoveisStore.fetchAllUnidades()
})
</script>
