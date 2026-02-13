<template>
  <v-dialog v-model="show" max-width="600px" persistent>
    <v-card class="rounded-lg">
      <v-card-title class="pa-4 bg-primary text-white d-flex align-center">
        <v-icon start icon="mdi-map-marker-plus" />
        <span>{{ endereco.id ? 'Editar Endereço' : 'Novo Endereço' }}</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="fechar" color="white"></v-btn>
      </v-card-title>
      <v-card-text class="pa-6">
        <v-form @submit.prevent="salvar">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="endereco.cep"
                label="CEP"
                variant="outlined"
                density="comfortable"
                @update:model-value="onCEPChange"
                :loading="buscandoCEP"
                prepend-inner-icon="mdi-numeric"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
                <!-- Espaçador ou outro campo se necessário -->
            </v-col>

            <v-col cols="12" md="8">
              <v-text-field
                v-model="endereco.logradouro"
                label="Logradouro"
                required
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-road"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="endereco.numero"
                label="Número"
                required
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="endereco.bairro"
                label="Bairro"
                required
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-home-outline"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="endereco.complemento"
                label="Complemento"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="endereco.estado"
                :items="estados"
                item-title="nome"
                item-value="sigla"
                label="Estado (UF)"
                variant="outlined"
                density="comfortable"
                @update:model-value="onEstadoChange"
                required
                prepend-inner-icon="mdi-map-outline"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-autocomplete
                v-model="endereco.cidade"
                :items="cidades"
                item-title="nome"
                item-value="nome"
                label="Cidade"
                required
                variant="outlined"
                density="comfortable"
                :loading="carregandoCidades"
                :disabled="!endereco.estado"
                prepend-inner-icon="mdi-city-variant-outline"
              />
            </v-col>

            <v-col cols="12">
              <v-checkbox
                v-model="endereco.isPreferencial"
                label="Definir como endereço preferencial"
                color="primary"
                hide-details
              />
            </v-col>
          </v-row>

          <div class="d-flex justify-end ga-2 mt-6">
            <v-btn variant="tonal" @click="fechar">Cancelar</v-btn>
            <v-btn color="primary" type="submit" :loading="salvando" elevation="1">
                {{ endereco.id ? 'Atualizar' : 'Salvar Endereço' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useClientesStore } from '../../stores/clientesStore'
import { notificationsStore } from '../../stores/notificationsStore'

const props = defineProps<{
  modelValue: boolean
  clienteId: string
  enderecoEdicao?: any
}>()

const emit = defineEmits(['update:modelValue', 'saved'])

const clientesStore = useClientesStore()
const show = ref(false)
const buscandoCEP = ref(false)
const carregandoCidades = ref(false)
const salvando = ref(false)

const estados = ref<any[]>([])
const cidades = ref<any[]>([])

const endereco = ref({
  id: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  pais: 'Brasil',
  cep: '',
  isPreferencial: false
})

watch(() => props.modelValue, (val) => {
  show.value = val
  if (val) {
    if (props.enderecoEdicao) {
        endereco.value = { ...props.enderecoEdicao }
        if (endereco.value.estado) carregarCidades(endereco.value.estado)
    } else {
        endereco.value = {
            id: '', logradouro: '', numero: '', complemento: '', bairro: '', 
            cidade: '', estado: '', pais: 'Brasil', cep: '', isPreferencial: false
        }
        cidades.value = []
    }
  }
})

watch(show, (val) => {
  emit('update:modelValue', val)
})

onMounted(async () => {
    estados.value = await clientesStore.carregarEstados()
})

const onCEPChange = async (val: string) => {
    const cleanCep = val?.replace(/\D/g, '') || ''
    if (cleanCep.length === 8) {
        buscandoCEP.value = true
        const data = await clientesStore.buscarCEP(cleanCep)
        if (data) {
            endereco.value.logradouro = data.logradouro
            endereco.value.bairro = data.bairro
            endereco.value.estado = data.estado
            await carregarCidades(data.estado)
            endereco.value.cidade = data.cidade
        }
        buscandoCEP.value = false
    }
}

const onEstadoChange = async (uf: string) => {
    endereco.value.cidade = ''
    if (uf) await carregarCidades(uf)
}

const carregarCidades = async (uf: string) => {
    carregandoCidades.value = true
    cidades.value = await clientesStore.carregarCidades(uf)
    carregandoCidades.value = false
}

const fechar = () => {
    show.value = false
}

const salvar = async () => {
    if (!props.clienteId) {
        notificationsStore.notify('ID do cliente não informado', 'error')
        return
    }

    try {
        salvando.value = true
        let response
        if (endereco.value.id) {
            response = await clientesStore.atualizarEndereco(props.clienteId, endereco.value.id, endereco.value)
            notificationsStore.notify('Endereço atualizado com sucesso')
        } else {
            response = await clientesStore.adicionarEndereco(props.clienteId, endereco.value)
            notificationsStore.notify('Endereço cadastrado com sucesso')
        }
        emit('saved', response)
        fechar()
    } catch (error) {
        notificationsStore.notify('Erro ao salvar endereço. Verifique os dados.', 'error')
    } finally {
        salvando.value = false
    }
}
</script>
