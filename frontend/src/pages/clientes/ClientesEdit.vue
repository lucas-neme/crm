<template>
  <v-container fluid class="page">
    <v-card elevation="2" class="form-card">
      <v-card-title>Editar Cliente</v-card-title>
      <v-card-text>
        <v-progress-linear v-if="carregando" indeterminate class="mb-4" />
        <v-form v-else @submit.prevent="salvarCliente">
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
              <v-text-field v-model="form.dtNascimento" label="Data de Nascimento" type="date" />
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
          </v-row>
          
          <v-tabs v-model="tab" bg-color="transparent" color="primary" grow>
            <v-tab value="observacoes">Observações</v-tab>
            <v-tab value="interesses">Interesses</v-tab>
            <v-tab value="anexos">Anexos</v-tab>
          </v-tabs>

          <v-window v-model="tab" class="mt-4">
            <v-window-item value="observacoes">
               <v-textarea v-model="form.observacoes" label="Observações" rows="5" variant="outlined" />
            </v-window-item>

            <v-window-item value="interesses">
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
              <v-textarea
                v-else
                v-model="form.interesse"
                label="Descricao dos interesses"
                rows="4"
                variant="outlined"
              />
            </v-window-item>

            <v-window-item value="anexos">
                 <v-alert type="info" variant="tonal" class="mb-4">
                    Funcionalidade de Anexos em desenvolvimento.
                </v-alert>
                <div class="d-flex justify-center align-center border-dashed pa-8 rounded">
                    <v-icon icon="mdi-cloud-upload" size="large" class="mr-2"></v-icon>
                    <span>Arraste arquivos aqui ou clique para selecionar</span>
                </div>
            </v-window-item>
          </v-window>

          <div class="form-actions mt-6">
            <v-btn color="primary" type="submit">Salvar</v-btn>
            <v-btn variant="tonal" to="/clientes">Cancelar</v-btn>
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
        <v-card-text>Deseja salvar as alterações deste cliente?</v-card-text>
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
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useClientesStore } from '../../stores/clientesStore'
import { useModulesStore } from '../../stores/modulesStore'
import { useImoveisStore } from '../../stores/imoveisStore'
import { PessoaTipoEnum, PESSOA_TIPO_OPTIONS } from '../../types/enums/pessoa-tipo.enum'
import { maskPhone, maskDocument } from '../../utils/formatters'
import {
  parseInteressesEmpreendimentos,
  serializeInteressesEmpreendimentos,
} from '../../utils/clienteInteressesImobiliarios'

const router = useRouter()
const route = useRoute()
const { obterCliente, carregarClientePorId, atualizarCliente, carregarClientes } = useClientesStore()
const modulesStore = useModulesStore()
const imoveisStore = useImoveisStore()

const clienteId = route.params.id as string
const carregando = ref(true)
const confirmarSalvar = ref(false)
const tab = ref(null)
const interessesEmpreendimentos = ref<string[]>([])
const isCrmImobiliario = computed(() => modulesStore.produtoModulo === 'IMOBILIARIA')

const form = ref({
  nome: '',
  email: '',
  telefone: '',
  tipoPessoa: PessoaTipoEnum.FISICA,
  isAtivo: true,
  dtNascimento: '',
  documento: '',
  tipoCliente: '',
  observacoes: '',
  pipelineStage: 'NOVO',
  temperatura: 'FRIA',
  origem: '',
  interesse: '',
})

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

const carregarCliente = async () => {
  let cliente = null as any
  try {
    cliente = await carregarClientePorId(clienteId)
  } catch (e) {
    cliente = obterCliente(clienteId)
    if (!cliente) {
      await carregarClientes()
      cliente = obterCliente(clienteId)
    }
  }

  if (!cliente) {
    alert('Cliente não encontrado.')
    router.push('/clientes')
    return
  }

  form.value = {
    nome: cliente.nome || '',
    email: cliente.email || '',
    telefone: maskPhone(cliente.telefone || ''),
    tipoPessoa: cliente.tipoPessoa || PessoaTipoEnum.FISICA,
    isAtivo: cliente.isAtivo !== undefined ? cliente.isAtivo : true,
    dtNascimento: cliente.dtNascimento || '',
    documento: cliente.documento || '',
    tipoCliente: cliente.tipoCliente || '',
    observacoes: cliente.observacoes || '',
    pipelineStage: cliente.pipelineStage || 'NOVO',
    temperatura: cliente.temperatura || 'FRIA',
    origem: cliente.origem || '',
    interesse: cliente.interesse || '',
  }
  interessesEmpreendimentos.value = parseInteressesEmpreendimentos(cliente.interesse)
  carregando.value = false
}


const applyPhoneMask = () => {
  form.value.telefone = maskPhone(form.value.telefone)
}

const salvarCliente = () => {
  confirmarSalvar.value = true
}

const confirmarSalvarEdicao = async () => {
  try {
    const payload = { ...form.value }
    payload.telefone = payload.telefone.replace(/\D/g, '')
    if (isCrmImobiliario.value) {
      payload.interesse = serializeInteressesEmpreendimentos(interessesEmpreendimentos.value)
    }
    
    await atualizarCliente(clienteId, payload)
    confirmarSalvar.value = false
    router.push(`/clientes/${clienteId}`)
  } catch (error: any) {
    alert(error.message || 'Erro ao salvar cliente.')
  }
}

onMounted(async () => {
  await modulesStore.fetchConfig()
  if (modulesStore.produtoModulo === 'IMOBILIARIA') {
    await imoveisStore.fetchEmpreendimentos()
  }
  await carregarCliente()
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
