<template>
  <v-container fluid class="page">
    <v-card elevation="2" class="form-card">
      <v-card-title>Novo Cliente</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="salvarCliente">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.nome" label="Nome" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="form.email" label="Email" type="email" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.telefone"
                label="Telefone"
                maxlength="15"
                required
                @input="applyPhoneMask"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.tipoPessoa"
                :items="PESSOA_TIPO_OPTIONS"
                item-title="label"
                item-value="value"
                label="Tipo de Pessoa *"
                required
                @update:model-value="form.documento = ''"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.dtNascimento" 
                label="Data de Nascimento" 
                type="date" 
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field 
                v-model="form.documento" 
                label="Documento" 
                :placeholder="documentoPlaceholder"
                @input="applyDocumentMask"
              />
            </v-col>
             <v-col cols="12" md="6">
              <v-select
                v-model="form.tipoCliente"
                :items="['VENDA', 'COMPRA', 'ALUGUEL']"
                label="Tipo de Cliente"
              />
            </v-col>
            <v-col cols="12">
                <v-textarea v-model="form.observacoes" label="Observações" rows="3" />
            </v-col>
            <v-col cols="12" md="6">
              <v-switch v-model="form.isAtivo" label="Cliente Ativo" color="primary" hide-details />
            </v-col>

            <v-col cols="12">
              <h3 class="mb-2">Dados do Lead (CRM)</h3>
              <v-divider class="mb-4"></v-divider>
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="form.pipelineStage"
                :items="['NOVO', 'CONTATO', 'VISITA', 'PROPOSTA', 'RESERVA', 'CONTRATO', 'GANHO', 'PERDIDO']"
                label="Etapa do Funil"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.temperatura"
                :items="['FRIA', 'MORNA', 'QUENTE']"
                label="Temperatura"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.origem" label="Origem (Ex: Instagram, Site)" />
            </v-col>
            <v-col cols="12">
              <v-select
                v-if="isCrmImobiliario"
                v-model="interessesEmpreendimentos"
                :items="imoveisStore.empreendimentos"
                item-title="nome"
                item-value="id"
                label="Empreendimentos de interesse"
                chips
                multiple
                clearable
                hint="Selecione um ou mais empreendimentos cadastrados"
                persistent-hint
              />
              <v-text-field
                v-else
                v-model="form.interesse"
                label="Interesse (Ex: Apt 3 quartos, Casa com piscina)"
              />
            </v-col>
          </v-row>

          <div class="form-actions">
            <v-btn color="primary" type="submit">Salvar</v-btn>
            <v-btn variant="tonal" to="/clientes">Cancelar</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClientesStore } from '../../stores/clientesStore'
import { useModulesStore } from '../../stores/modulesStore'
import { useImoveisStore } from '../../stores/imoveisStore'
import { PessoaTipoEnum, PESSOA_TIPO_OPTIONS } from '../../types/enums/pessoa-tipo.enum'
import { maskPhone, maskDocument } from '../../utils/formatters'
import { serializeInteressesEmpreendimentos } from '../../utils/clienteInteressesImobiliarios'

const router = useRouter()
const { adicionarCliente } = useClientesStore()
const modulesStore = useModulesStore()
const imoveisStore = useImoveisStore()

const form = ref({
  nome: '',
  email: '',
  telefone: '',
  tipoPessoa: PessoaTipoEnum.FISICA,
  dtNascimento: '',
  documento: '',
  tipoCliente: '',
  observacoes: '',
  isAtivo: true,
  pipelineStage: 'NOVO',
  temperatura: 'FRIA',
  origem: '',
  interesse: '',
})
const interessesEmpreendimentos = ref<string[]>([])
const isCrmImobiliario = computed(() => modulesStore.produtoModulo === 'IMOBILIARIA')

const applyPhoneMask = () => {
  form.value.telefone = maskPhone(form.value.telefone)
}

const documentoPlaceholder = computed(() => {
    switch(form.value.tipoPessoa) {
        case PessoaTipoEnum.FISICA: return 'CPF (XXX.XXX.XXX-XX)'
        case PessoaTipoEnum.JURIDICA: return 'CNPJ (XX.XXX.XXX/XXXX-XX)'
        case PessoaTipoEnum.ESTRANGEIRA: return 'Passaporte (AAXXXXXX)'
        default: return 'Documento'
    }
})

const applyDocumentMask = () => {
    form.value.documento = maskDocument(form.value.documento, form.value.tipoPessoa)
}


const salvarCliente = async () => {
  try {
    const payload = { ...form.value }
    payload.telefone = payload.telefone.replace(/\D/g, '')
    if (isCrmImobiliario.value) {
      payload.interesse = serializeInteressesEmpreendimentos(interessesEmpreendimentos.value)
    }
    
    console.log('Cliente criado:', payload)
    await adicionarCliente(payload)
    router.push('/clientes')
  } catch (error) {
    alert('Erro ao salvar cliente. Verifique se o backend está rodando.')
  }
}

onMounted(async () => {
  await modulesStore.fetchConfig()
  if (modulesStore.produtoModulo === 'IMOBILIARIA') {
    await imoveisStore.fetchEmpreendimentos()
  }
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
