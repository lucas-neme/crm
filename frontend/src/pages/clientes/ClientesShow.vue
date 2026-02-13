<template>
  <v-container fluid class="page">
    <div class="page-header">
      <h2 class="page-title">Cliente - Edição</h2>
      <div class="page-actions">
        <v-btn color="primary" variant="tonal" :to="`/clientes/${clienteId}/editar`" prepend-icon="mdi-pencil">Editar</v-btn>
        <v-btn color="error" variant="tonal" @click="abrirConfirmacaoExcluir" prepend-icon="mdi-delete">Excluir</v-btn>
      </div>
    </div>

    <v-card elevation="2" class="detail-card">
      <v-card-title class="pa-6">
        <div class="title-row">
          <div>
            <h2 class="text-h4 font-weight-bold mb-1">{{ cliente.nome }}</h2>
            <p class="subtitle">Codigo #{{ String(cliente.codigo ?? 0).padStart(3, '0') }}</p>
          </div>
          <v-chip :color="cliente.isAtivo ? 'success' : 'grey-lighten-2'" variant="flat">
            {{ cliente.isAtivo ? 'Ativo' : 'Inativo' }}
          </v-chip>
        </div>
      </v-card-title>

      <v-card-text class="px-6 pb-6">
        <v-row class="mt-2">
          <v-col cols="12" sm="6" md="4">
            <v-list-item class="px-0">
              <v-list-item-subtitle class="text-caption mb-1">Email</v-list-item-subtitle>
              <v-list-item-title class="text-body-1">{{ cliente.email || '-' }}</v-list-item-title>
            </v-list-item>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-list-item class="px-0">
              <v-list-item-subtitle class="text-caption mb-1">Telefone</v-list-item-subtitle>
              <v-list-item-title class="text-body-1">{{ formatTelefone(cliente.telefone) || '-' }}</v-list-item-title>
            </v-list-item>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-list-item class="px-0">
              <v-list-item-subtitle class="text-caption mb-1">Documento</v-list-item-subtitle>
              <v-list-item-title class="text-body-1">{{ maskDocument(cliente.documento || '', cliente.tipoPessoa) || '-' }}</v-list-item-title>
            </v-list-item>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-list-item class="px-0">
              <v-list-item-subtitle class="text-caption mb-1">Data de Nascimento</v-list-item-subtitle>
              <v-list-item-title class="text-body-1">{{ formatDate(cliente.dtNascimento) }}</v-list-item-title>
            </v-list-item>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-list-item class="px-0">
              <v-list-item-subtitle class="text-caption mb-1">Tipo de Pessoa</v-list-item-subtitle>
              <v-list-item-title class="text-body-1">{{ formatTipoPessoa(cliente.tipoPessoa) }}</v-list-item-title>
            </v-list-item>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-list-item class="px-0">
              <v-list-item-subtitle class="text-caption mb-1">Tipo de Cliente</v-list-item-subtitle>
              <v-list-item-title class="text-body-1">{{ cliente.tipoCliente || '-' }}</v-list-item-title>
            </v-list-item>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-list-item class="px-0">
              <v-list-item-subtitle class="text-caption mb-1">Origem</v-list-item-subtitle>
              <v-list-item-title class="text-body-1">{{ cliente.origem || '-' }}</v-list-item-title>
            </v-list-item>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-list-item class="px-0">
              <v-list-item-subtitle class="text-caption mb-1">Etapa do Funil</v-list-item-subtitle>
              <v-list-item-title class="text-body-1">
                <v-chip size="small" color="primary" label>{{ cliente.pipelineStage || 'NOVO' }}</v-chip>
              </v-list-item-title>
            </v-list-item>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-list-item class="px-0">
              <v-list-item-subtitle class="text-caption mb-1">Temperatura</v-list-item-subtitle>
              <v-list-item-title class="text-body-1">
                <v-chip size="small" :color="getTemperaturaColor(cliente.temperatura)" label>
                  {{ cliente.temperatura || 'FRIA' }}
                </v-chip>
              </v-list-item-title>
            </v-list-item>
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <v-tabs v-model="tab" color="primary" align-tabs="start" class="mb-4">
          <v-tab value="enderecos" prepend-icon="mdi-map-marker" class="text-none">Endereços</v-tab>
          <v-tab value="observacoes" prepend-icon="mdi-text" class="text-none">Observações</v-tab>
          <v-tab value="interesses" prepend-icon="mdi-heart" class="text-none">Interesses</v-tab>
          <v-tab value="anexos" prepend-icon="mdi-paperclip" class="text-none">Anexos</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <v-window-item value="enderecos">
            <div class="d-flex justify-between align-center mb-4">
              <h3 class="text-h6">Endereços Cadastrados</h3>
              <v-spacer />
              <v-btn color="primary" prepend-icon="mdi-plus" size="small" @click="abrirModalEndereco()">Novo Endereço</v-btn>
            </div>

            <v-row v-if="enderecos.length > 0">
              <v-col v-for="addr in enderecos" :key="addr.id" cols="12" md="6">
                <v-card variant="outlined" class="addr-card" :class="{ 'pref-card': addr.isPreferencial }">
                  <v-card-item>
                    <template #prepend>
                      <v-icon :color="addr.isPreferencial ? 'primary' : 'grey'" :icon="addr.isPreferencial ? 'mdi-map-marker-star' : 'mdi-map-marker'" />
                    </template>
                    <v-card-title class="text-subtitle-1">
                      {{ addr.logradouro }}, {{ addr.numero }}
                      <v-chip v-if="addr.isPreferencial" size="x-small" color="primary" class="ml-2">Preferencial</v-chip>
                    </v-card-title>
                    <v-card-subtitle>
                      {{ addr.bairro }} - {{ addr.cidade }}/{{ addr.estado }}<br>
                      CEP: {{ addr.cep }}
                    </v-card-subtitle>
                  </v-card-item>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn v-if="!addr.isPreferencial" size="small" variant="text" color="primary" @click="definirPreferencial(addr)">
                      Tornar Preferencial
                    </v-btn>
                    <v-btn size="small" variant="text" icon="mdi-pencil" title="Editar" @click="abrirModalEndereco(addr)" />
                    <v-btn size="small" variant="text" color="error" icon="mdi-delete" title="Excluir" @click="removerEnderecoConfirm(addr)" />
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
            <v-alert v-else type="info" variant="tonal">Nenhum endereço cadastrado para este cliente.</v-alert>
          </v-window-item>

          <v-window-item value="observacoes">
            <p class="text-body-1 pa-4 bg-grey-lighten-4 rounded">
              {{ cliente.observacoes || 'Nenhuma observação cadastrada.' }}
            </p>
          </v-window-item>

          <v-window-item value="interesses">
            <div class="pa-4">
              <v-card v-if="isCrmImobiliario" variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-2">Empreendimentos de Interesse</v-card-title>
                <v-card-text>
                  <div v-if="interessesEmpreendimentosSelecionados.length" class="d-flex flex-wrap ga-2">
                    <v-chip
                      v-for="emp in interessesEmpreendimentosSelecionados"
                      :key="emp.id"
                      color="primary"
                      variant="tonal"
                      size="small"
                    >
                      {{ emp.nome }}
                    </v-chip>
                  </div>
                  <span v-else>Nenhum empreendimento de interesse vinculado.</span>
                </v-card-text>
              </v-card>
              <v-card v-else variant="outlined" class="mb-4">
                <v-card-title class="text-subtitle-2">Descricao dos Interesses</v-card-title>
                <v-card-text>
                  {{ cliente.interesse || 'Nenhum interesse especifico descrito.' }}
                </v-card-text>
              </v-card>
            </div>
          </v-window-item>

          <v-window-item value="anexos">
            <v-alert type="info" variant="text" class="mb-4">
              Funcionalidade de anexos em desenvolvimento.
            </v-alert>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <EnderecoDialog
      v-model="showAddrModal"
      :cliente-id="clienteId"
      :endereco-edicao="modalAddr"
      @saved="carregarEnderecosCliente"
    />

    <v-dialog v-model="confirmarExcluir" max-width="440">
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon icon="mdi-delete" color="error" />
          Confirmar exclusao
        </v-card-title>
        <v-card-text>Tem certeza que deseja excluir este cliente? Essa acao nao podera ser desfeita.</v-card-text>
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
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClientesStore } from '../../stores/clientesStore'
import { useModulesStore } from '../../stores/modulesStore'
import { useImoveisStore } from '../../stores/imoveisStore'
import { formatTelefone, maskDocument } from '../../utils/formatters'
import { PESSOA_TIPO_OPTIONS, PessoaTipoEnum } from '../../types/enums/pessoa-tipo.enum'
import { notificationsStore } from '../../stores/notificationsStore'
import EnderecoDialog from '../../components/common/EnderecoDialog.vue'
import { parseInteressesEmpreendimentos } from '../../utils/clienteInteressesImobiliarios'

const router = useRouter()
const route = useRoute()
const clientesStore = useClientesStore()
const modulesStore = useModulesStore()
const imoveisStore = useImoveisStore()
const { obterCliente, carregarClientePorId, deletarCliente, carregarEnderecos, atualizarEndereco, removerEndereco } = clientesStore

const clienteId = route.params.id as string
const confirmarExcluir = ref(false)
const tab = ref('enderecos')
const enderecos = ref<any[]>([])
const showAddrModal = ref(false)
const modalAddr = ref<any>({
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
  isPreferencial: false
})

const cliente = computed(() => {
  const clienteData = obterCliente(clienteId)
  return clienteData || {
    id: clienteId,
    codigo: 0,
    nome: 'Carregando...',
    email: '',
    telefone: '',
    tipoPessoa: PessoaTipoEnum.FISICA,
  }
})

const isCrmImobiliario = computed(() => modulesStore.produtoModulo === 'IMOBILIARIA')

const interessesEmpreendimentosSelecionados = computed(() => {
  const ids = parseInteressesEmpreendimentos(cliente.value.interesse)
  if (!ids.length) return []

  const byId = new Map(imoveisStore.empreendimentos.map((emp) => [emp.id, emp]))
  return ids.map((id) => byId.get(id) || { id, nome: `Empreendimento (${id})` })
})

onMounted(async () => {
  await modulesStore.fetchConfig()
  if (modulesStore.produtoModulo === 'IMOBILIARIA') {
    await imoveisStore.fetchEmpreendimentos()
  }
  await carregarClientePorId(clienteId)
  await carregarEnderecosCliente()
})

const carregarEnderecosCliente = async () => {
  enderecos.value = await carregarEnderecos(clienteId)
}

const formatTipoPessoa = (tipoPessoa: string) => {
  const option = PESSOA_TIPO_OPTIONS.find(opt => opt.value === tipoPessoa)
  return option?.label || tipoPessoa
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const getTemperaturaColor = (temp?: string) => {
  switch (temp) {
    case 'QUENTE': return 'error'
    case 'MORNA': return 'warning'
    case 'FRIA': return 'info'
    default: return 'grey'
  }
}

const abrirConfirmacaoExcluir = () => {
  confirmarExcluir.value = true
}

const confirmarExclusao = async () => {
  await deletarCliente(clienteId)
  confirmarExcluir.value = false
  notificationsStore.notify('Cliente excluido com sucesso')
  router.push('/clientes')
}

const abrirModalEndereco = (addr?: any) => {
  if (addr) {
    modalAddr.value = { ...addr }
  } else {
    modalAddr.value = null
  }
  showAddrModal.value = true
}

const definirPreferencial = async (addr: any) => {
  try {
    await atualizarEndereco(clienteId, addr.id, { ...addr, isPreferencial: true })
    notificationsStore.notify('Endereco preferencial atualizado')
    await carregarEnderecosCliente()
  } catch (_e) {
    notificationsStore.notify('Erro ao atualizar', 'error')
  }
}

const removerEnderecoConfirm = async (addr: any) => {
  if (confirm('Deseja excluir este endereco?')) {
    await removerEndereco(clienteId, addr.id)
    notificationsStore.notify('Endereco removido')
    await carregarEnderecosCliente()
  }
}
</script>

<style scoped>
.page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.page-title { margin: 0; color: #111827; }
.page-actions { display: flex; gap: 0.75rem; }
.detail-card { border-radius: 16px; overflow: hidden; }
.subtitle { margin: 0; color: #6b7280; font-size: 0.9rem; }
.title-row { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.addr-card { border-radius: 12px; transition: all 0.2s; }
.addr-card:hover { border-color: #3b82f6; background-color: #f8faff; }
.pref-card { border-color: #3b82f6; border-width: 2px; background-color: #f0f7ff; }
</style>
