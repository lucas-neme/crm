<template>
  <v-container fluid class="page">
    <v-card elevation="2" class="form-card">
      <v-card-title class="pa-4 bg-primary text-white">Editar Negócio</v-card-title>
      <v-card-text class="pa-6">
        <v-progress-linear v-if="carregando" indeterminate class="mb-4" />
        <v-form v-else @submit.prevent="salvarNegocio">
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.clienteId"
                :items="clientes"
                item-title="nome"
                item-value="id"
                label="Cliente"
                variant="outlined"
                density="comfortable"
                @update:model-value="carregarEnderecosCliente"
                required
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.dataVenda"
                label="Data da Venda"
                type="date"
                variant="outlined"
                density="comfortable"
                @keydown.h.prevent.stop="() => setShortcutDate('dataVenda', 'hoje')"
                @keydown.a.prevent.stop="() => setShortcutDate('dataVenda', 'amanha')"
                @keydown.o.prevent.stop="() => setShortcutDate('dataVenda', 'ontem')"
                hint="Atalhos: H (Hoje), A (Amanhã), O (Ontem)"
                persistent-hint
                required
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.dataEntrega"
                label="Data Prevista de Entrega"
                type="date"
                variant="outlined"
                density="comfortable"
                @keydown.h.prevent.stop="() => setShortcutDate('dataEntrega', 'hoje')"
                @keydown.a.prevent.stop="() => setShortcutDate('dataEntrega', 'amanha')"
                @keydown.o.prevent.stop="() => setShortcutDate('dataEntrega', 'ontem')"
              />
            </v-col>
            <v-col cols="12" md="4" class="d-flex align-center">
              <v-checkbox v-model="form.entrega" label="Requer Entrega" hide-details />
            </v-col>

            <v-fade-transition>
                <v-col cols="12" v-if="form.entrega">
                    <div class="d-flex align-center ga-2 mb-2">
                        <v-select
                          v-model="form.enderecoEntregaId"
                          :items="enderecosCliente"
                          label="Endereço de Entrega"
                          item-title="logradouro"
                          item-value="id"
                          variant="outlined"
                          density="comfortable"
                          hint="Selecione um endereço cadastrado do cliente"
                          persistent-hint
                          class="flex-grow-1"
                        >
                            <template v-slot:item="{ props, item }">
                                <v-list-item v-bind="props" :subtitle="`${item.raw.numero}, ${item.raw.bairro} - ${item.raw.cidade}/${item.raw.estado}`">
                                    <template v-slot:append v-if="item.raw.isPreferencial">
                                        <v-chip size="x-small" color="primary">Preferencial</v-chip>
                                    </template>
                                </v-list-item>
                            </template>
                        </v-select>
                        <v-btn
                            color="secondary"
                            variant="tonal"
                            prepend-icon="mdi-map-marker-plus"
                            @click="showAddressDialog = true"
                            :disabled="!form.clienteId"
                            class="mb-6"
                        >
                            Novo Endereço
                        </v-btn>
                    </div>
                </v-col>
            </v-fade-transition>
          </v-row>

          <v-divider class="my-6" />

          <div class="section-title">{{ sectionTitle }}</div>
          <v-row v-for="(item, index) in form.produtos" :key="index" class="mb-2" align="center">
            <v-col cols="12" md="4">
              <v-select
                v-model="item.produtoId"
                :items="itensDisponiveis"
                item-title="nome"
                item-value="id"
                :label="itemLabel"
                variant="outlined"
                density="comfortable"
                @update:model-value="() => atualizarValorUnitario(index)"
                required
              />
            </v-col>
            <v-col cols="4" md="2">
              <v-text-field v-model.number="item.quantidade" label="Qtd" type="number" min="1" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="4" md="3">
              <v-text-field v-model.number="item.valorUnitario" label="Vlr Unitário" type="number" min="0" step="0.01" prefix="R$" variant="outlined" density="comfortable" />
            </v-col>
            <v-col cols="4" md="2">
              <v-text-field v-model.number="item.desconto" label="Desc. Item" type="number" min="0" step="0.01" prefix="R$" variant="outlined" density="comfortable" color="orange-darken-2" />
            </v-col>
            <v-col cols="12" md="1" class="text-right d-flex justify-end">
                <v-tooltip text="Remover Produto" location="top">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" icon="mdi-delete" color="error" variant="tonal" size="small" @click="removerItem(index)"></v-btn>
                    </template>
                </v-tooltip>
            </v-col>
          </v-row>

          <v-btn variant="text" color="primary" prepend-icon="mdi-plus" class="mb-6" @click="adicionarItem">Adicionar {{ itemLabel }}</v-btn>

          <v-divider class="mb-6"></v-divider>

          <v-row justify="end" align="center">
            <v-col cols="12" md="4">
                <v-text-field 
                    v-model.number="form.descontoGeral" 
                    label="Desconto no Total" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    prefix="R$"
                    variant="outlined"
                    color="orange-darken-3"
                    density="comfortable"
                />
            </v-col>
            <v-col cols="12" md="4">
                <div class="total-container pa-3 rounded-lg">
                    <div class="text-overline text-grey-darken-1 mb-n1">Valor Final do Negócio</div>
                    <div class="text-h4 font-weight-bold text-primary">
                        {{ formatBRL(valorFinal) }}
                    </div>
                </div>
            </v-col>
          </v-row>

          <div class="form-actions mt-8">
            <v-btn color="primary" size="large" @click="salvarNegocio" elevation="2" :loading="salvando">Salvar Alterações</v-btn>
            <v-btn variant="tonal" size="large" to="/negocios">Cancelar</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Modal para Novo Endereço -->
    <EnderecoDialog 
        v-model="showAddressDialog" 
        :cliente-id="form.clienteId" 
        @saved="onAddressSaved" 
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNegociosStore } from '../../stores/negociosStore'
import { useClientesStore } from '../../stores/clientesStore'
import { useProdutosStore } from '../../stores/produtosStore'
import { useModulesStore } from '../../stores/modulesStore'
import { notificationsStore } from '../../stores/notificationsStore'
import EnderecoDialog from '../../components/common/EnderecoDialog.vue'

const router = useRouter()
const route = useRoute()
const negociosStore = useNegociosStore()
const clientesStore = useClientesStore()
const produtosStore = useProdutosStore()
const modulesStore = useModulesStore()

const { atualizarNegocio, carregarNegocioPorId, obterNegocio } = negociosStore
const { clientes, carregarClientes } = clientesStore
const { produtos, carregarProdutos } = produtosStore

const negocioId = route.params.id as string
const carregando = ref(true)
const salvando = ref(false)
const showAddressDialog = ref(false)
const enderecosCliente = ref<any[]>([])
const itensDisponiveis = ref<Array<{ id: string; nome: string; valorUnitario: number }>>([])

const isImobiliaria = computed(() => modulesStore.produtoModulo === 'IMOBILIARIA')
const itemLabel = computed(() => (isImobiliaria.value ? 'Unidade' : 'Produto'))
const sectionTitle = computed(() => (isImobiliaria.value ? 'Unidades Imobiliárias' : 'Produtos'))

const form = ref({
  clienteId: '',
  entrega: false,
  enderecoEntregaId: '',
  dataVenda: '',
  dataEntrega: '',
  descontoGeral: 0,
  produtos: [
    { produtoId: '', quantidade: 1, valorUnitario: 0, desconto: 0 },
  ],
})

const onAddressSaved = (addr: any) => {
    enderecosCliente.value.push(addr)
    form.value.enderecoEntregaId = addr.id
}

const formatarDataInput = (valor?: string | Date) => {
  if (!valor) return ''
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return String(valor).slice(0, 10)
  return data.toISOString().slice(0, 10)
}

const setShortcutDate = (field: 'dataVenda' | 'dataEntrega', type: 'hoje' | 'amanha' | 'ontem') => {
    const now = new Date()
    if (type === 'hoje') {
        form.value[field] = now.toISOString().slice(0, 10)
    } else if (type === 'amanha') {
        const tomorrow = new Date(now)
        tomorrow.setDate(now.getDate() + 1)
        form.value[field] = tomorrow.toISOString().slice(0, 10)
    } else if (type === 'ontem') {
        const yesterday = new Date(now)
        yesterday.setDate(now.getDate() - 1)
        form.value[field] = yesterday.toISOString().slice(0, 10)
    }
}

const carregarNegocio = async () => {
  await modulesStore.fetchConfig()
  await carregarClientes()

  if (isImobiliaria.value) {
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/unidades`)
    const unidades = res.ok ? await res.json() : []
    itensDisponiveis.value = (unidades || []).map((u: any) => ({
      id: u.id,
      nome: `${u.codigoInterno || u.id} - ${u.tipo || 'Unidade'}`,
      valorUnitario: Number(u.valorOferta ?? u.valorTabela ?? 0),
    }))
  } else {
    await carregarProdutos()
    itensDisponiveis.value = (produtos.value || []).map((p: any) => ({
      id: p.id,
      nome: p.nome,
      valorUnitario: Number(p.valorUnitario ?? 0),
    }))
  }

  let negocio = obterNegocio(negocioId)
  if (!negocio) negocio = await carregarNegocioPorId(negocioId)
  if (!negocio) {
    notificationsStore.notify('Negócio não encontrado.', 'error')
    router.push('/negocios')
    return
  }

  form.value = {
    clienteId: negocio.clienteId || '',
    entrega: Boolean(negocio.entrega),
    enderecoEntregaId: (negocio as any).enderecoEntregaId || '',
    dataVenda: formatarDataInput(negocio.dataVenda),
    dataEntrega: formatarDataInput(negocio.dataEntrega),
    descontoGeral: Number((negocio as any).descontoGeral) || 0,
    produtos: (negocio.produtos || []).map(item => ({
      produtoId: (item as any).produtoId || (item as any).id,
      quantidade: Number((item as any).quantidade) || 1,
      valorUnitario: Number((item as any).valorUnitario) || 0,
      desconto: Number((item as any).desconto) || 0
    })),
  }

  if (form.value.clienteId) await carregarEnderecosCliente(form.value.clienteId)
  if (form.value.produtos.length === 0) form.value.produtos.push({ produtoId: '', quantidade: 1, valorUnitario: 0, desconto: 0 })
  carregando.value = false
}

const carregarEnderecosCliente = async (clienteId: string) => {
    if (!clienteId) {
        enderecosCliente.value = []
        return
    }
    enderecosCliente.value = await clientesStore.carregarEnderecos(clienteId)
}

const adicionarItem = () => form.value.produtos.push({ produtoId: '', quantidade: 1, valorUnitario: 0, desconto: 0 })

const removerItem = (index: number) => {
  if (form.value.produtos.length > 1) form.value.produtos.splice(index, 1)
  else form.value.produtos[0] = { produtoId: '', quantidade: 1, valorUnitario: 0, desconto: 0 }
}

const atualizarValorUnitario = (index: number) => {
  const item = form.value.produtos[index]
  if (!item) return
  const selecionado = itensDisponiveis.value.find(p => p.id === item.produtoId)
  if (selecionado && (selecionado as any).valorUnitario !== undefined) {
    item.valorUnitario = Number((selecionado as any).valorUnitario) || 0
  }
}

const valorFinal = computed(() => {
  const subtotal = form.value.produtos.reduce((acc, item) => {
    const v = Number(item.valorUnitario) || 0
    const q = Number(item.quantidade) || 0
    const d = Number(item.desconto) || 0
    return acc + (v * q) - d
  }, 0)
  return Math.max(0, subtotal - (Number(form.value.descontoGeral) || 0))
})

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

const salvarNegocio = async () => {
    if (!form.value.clienteId) {
        notificationsStore.notify('Selecione um cliente.', 'warning')
        return
    }

    if (form.value.entrega && !form.value.enderecoEntregaId) {
        notificationsStore.notify('Selecione um endereço de entrega.', 'warning')
        return
    }

  const produtosValidos = form.value.produtos.filter(p => p.produtoId)
  if (produtosValidos.length === 0) {
        notificationsStore.notify(`Adicione pelo menos um ${itemLabel.value.toLowerCase()}.`, 'warning')
        return
    }

    try {
        salvando.value = true
        const payload = {
            clienteId: form.value.clienteId,
            entrega: Boolean(form.value.entrega),
            enderecoEntregaId: form.value.entrega ? form.value.enderecoEntregaId : undefined,
            dataVenda: form.value.dataVenda,
            dataEntrega: form.value.dataEntrega || undefined,
            descontoGeral: Number(form.value.descontoGeral) || 0,
            produtos: produtosValidos.map(p => ({
                produtoId: p.produtoId,
                quantidade: Number(p.quantidade),
                valorUnitario: Number(p.valorUnitario),
                desconto: Number(p.desconto) || 0
            }))
        }

        await atualizarNegocio(negocioId, payload as any)
        notificationsStore.notify('Negócio atualizado com sucesso!')
        router.push(`/negocios/${negocioId}`)
    } catch (error: any) {
        console.error('Erro detalhado ao atualizar negócio:', error)
        const msg = error.response?.data?.message || error.message || 'Erro desconhecido'
        notificationsStore.notify(`Erro ao atualizar: ${msg}`, 'error')
    } finally {
        salvando.value = false
    }
}

onMounted(() => carregarNegocio())
</script>

<style scoped>
.page { padding: 0; }
.form-card { border-radius: 16px; max-width: 1000px; margin: 0 auto; overflow: hidden; }
.section-title { font-weight: 600; font-size: 1.1rem; color: #111827; margin-bottom: 1rem; }
.form-actions { display: flex; gap: 1rem; justify-content: flex-start; }
.total-container { border: 2px solid #3b82f6; background-color: #f0f7ff; min-width: 250px; text-align: right; }
</style>
