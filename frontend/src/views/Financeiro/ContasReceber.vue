<template>
  <v-container fluid class="page">
    <div class="page-header">
      <div class="title-wrap">
        <h2>{{ $t('menu.contas_receber') }}</h2>
        <p class="subtitle">Gerencie suas contas a receber cadastradas</p>
      </div>
      <div class="header-actions">
        <v-text-field
          v-if="!mobile"
          v-model="search"
          label="Pesquisar"
          prepend-inner-icon="mdi-magnify"
          density="compact"
          hide-details
          variant="outlined"
          class="search-field"
        />
        <v-menu v-if="mobile" v-model="searchMenu" :close-on-content-click="false" location="bottom start">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="tonal" color="primary" aria-label="Pesquisar">
              <v-icon icon="mdi-magnify" />
            </v-btn>
          </template>
          <v-card min-width="260" class="search-popover">
            <v-card-text>
              <v-text-field
                v-model="search"
                label="Pesquisar"
                prepend-inner-icon="mdi-magnify"
                density="compact"
                hide-details
                variant="outlined"
                autofocus
              />
            </v-card-text>
          </v-card>
        </v-menu>
        <ColumnManagerMenu
          v-model="visibleColumns"
          :columns="columns"
          @reset="resetColumns"
          @select-all="selectAllColumns"
        />
        <v-btn color="primary" @click="openNew" class="text-none action-btn">+ NOVA CONTA</v-btn>
      </div>
    </div>

    <v-card elevation="2" class="table-card">
      <v-card-text>
        <v-skeleton-loader
          v-if="store.loading"
          type="table-heading, table-row-divider@6"
          class="bg-transparent"
        ></v-skeleton-loader>

        <template v-else>
          <div v-if="mobile && filteredItems.length > 0" class="mobile-list">
            <v-card v-for="item in filteredItems" :key="item.id" class="mobile-item" elevation="1">
              <div class="mobile-item-head">
                <h3 class="mobile-name">{{ item.descricao }}</h3>
                <v-chip :color="getStatusColor(item.status)" size="small">{{ item.status }}</v-chip>
              </div>
              <div class="mobile-item-grid">
                <div>
                  <p class="mobile-label">Cliente</p>
                  <p class="mobile-value">{{ item.cliente?.nome || '-' }}</p>
                </div>
                <div>
                  <p class="mobile-label">Valor</p>
                  <p class="mobile-value">{{ formatCurrency(item.valor) }}</p>
                </div>
                <div>
                  <p class="mobile-label">Vencimento</p>
                  <p class="mobile-value">{{ formatDate(item.dtVencimento) }}</p>
                </div>
                <div>
                  <p class="mobile-label">Recebimento</p>
                  <p class="mobile-value">{{ formatDate(item.dtRecebimento) }}</p>
                </div>
              </div>
              <div class="mobile-actions">
                <v-btn size="small" color="warning" variant="tonal" @click="openEdit(item)">Editar</v-btn>
                <v-btn
                  v-if="item.status === 'PENDENTE'"
                  size="small"
                  color="success"
                  variant="tonal"
                  @click="markAsReceived(item)"
                >
                  Receber
                </v-btn>
                <v-btn size="small" color="info" variant="tonal" @click="notify(item)">Notificar</v-btn>
              </div>
            </v-card>
          </div>

          <v-data-table
            v-else-if="filteredItems.length > 0"
            :headers="headers"
            :items="filteredItems"
            no-data-text="Nenhum registro encontrado"
            items-per-page-text="Itens por página"
            page-text="{0}-{1} de {2}"
          >
            <template #item.cliente="{ item }">{{ item.cliente?.nome || '-' }}</template>
            <template #item.clienteEmail="{ item }">{{ item.cliente?.email || '-' }}</template>
            <template #item.status="{ item }"><v-chip :color="getStatusColor(item.status)">{{ item.status }}</v-chip></template>
            <template #item.valor="{ item }">{{ formatCurrency(item.valor) }}</template>
            <template #item.dtVencimento="{ item }">{{ formatDate(item.dtVencimento) }}</template>
            <template #item.dtRecebimento="{ item }">{{ formatDate(item.dtRecebimento) }}</template>
            <template #item.actions="{ item }">
              <v-btn icon="mdi-pencil" size="small" color="warning" variant="text" @click="openEdit(item)" title="Editar" class="mr-1"></v-btn>
              <v-btn
                v-if="item.status === 'PENDENTE'"
                icon="mdi-check-circle"
                size="small"
                color="success"
                variant="text"
                @click="markAsReceived(item)"
                title="Marcar como Recebido"
                class="mr-1"
              ></v-btn>
              <v-btn icon="mdi-bell" size="small" color="info" variant="text" @click="notify(item)" title="Notificar via Telegram"></v-btn>
            </template>
          </v-data-table>

          <div v-if="filteredItems.length === 0" class="empty-state">
            <v-icon icon="mdi-cash-plus" size="64" color="grey-lighten-1" class="mb-4" />
            <p class="text-h6 text-grey-darken-1 mb-2">Você ainda não tem Contas a Receber</p>
            <p class="text-body-2 text-grey mb-6">Cadastre sua primeira conta a receber aqui</p>
            <v-btn color="primary" @click="openNew" prepend-icon="mdi-plus">
              Nova Conta
            </v-btn>
          </div>
        </template>
      </v-card-text>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card class="rounded-lg">
        <v-card-title class="text-h6 font-weight-bold pa-4 bg-grey-lighten-4">
          <v-icon start icon="mdi-pencil" v-if="isEditing" />
          <v-icon start icon="mdi-plus" v-else />
          {{ isEditing ? 'Editar Conta a Receber' : 'Nova Conta a Receber' }}
        </v-card-title>
        <v-card-text class="pa-4 pt-6">
          <v-row dense>
             <v-col cols="12">
                <v-select 
                  v-model="formItem.clienteId" 
                  :items="(clientes as any)" 
                  item-title="nome" 
                  item-value="id" 
                  label="Cliente" 
                  clearable
                  variant="outlined"
                  density="comfortable"
                ></v-select>
             </v-col>
             <v-col cols="12">
                <v-text-field 
                  v-model="formItem.descricao" 
                  label="Descrição"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
             </v-col>
             <v-col cols="12" md="6">
                <v-text-field 
                  v-model="formItem.valor" 
                  label="Valor" 
                  type="number"
                  prefix="R$"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
             </v-col>
             <v-col cols="12" md="6">
                <v-text-field 
                  v-model="formItem.dtVencimento" 
                  label="Vencimento" 
                  type="date"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
             </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false" class="text-capitalize">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="save" class="text-capitalize">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">{{ confirmTitle }}</v-card-title>
        <v-card-text>{{ confirmMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="confirmDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="text" @click="executeConfirmAction">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
      <template #actions>
        <v-btn color="white" variant="text" @click="snackbar = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'
import { useFinanceiroStore } from '../../stores/financeiroStore'
import { useClientesStore } from '../../stores/clientesStore'
import ColumnManagerMenu from '../../components/common/ColumnManagerMenu.vue'
import { useColumnManager } from '../../composables/useColumnManager'

const { t } = useI18n()
const { mobile } = useDisplay()
const store = useFinanceiroStore()
const clientesStore = useClientesStore()
const dialog = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const search = ref('')
const searchMenu = ref(false)

const confirmDialog = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmAction = ref<() => Promise<void> | void>(() => {})

function openConfirmDialog(title: string, message: string, action: () => Promise<void> | void) {
  confirmTitle.value = title
  confirmMessage.value = message
  confirmAction.value = action
  confirmDialog.value = true
}

async function executeConfirmAction() {
  confirmDialog.value = false
  await confirmAction.value()
}

function showSnackbar(text: string, color: string = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

const items = computed(() => store.contasReceber)
const clientes = computed(() => clientesStore.clientes.value || [])

interface FormItem {
  descricao: string
  valor: string
  dtVencimento: string
  clienteId: string
}

const formItem = ref<FormItem>({ descricao: '', valor: '', dtVencimento: '', clienteId: '' })

const baseHeaders = computed(() => [
  { title: 'ID', key: 'id' },
  { title: 'Cliente', key: 'cliente' },
  { title: 'Email Cliente', key: 'clienteEmail' },
  { title: t('financeiro.descricao'), key: 'descricao' },
  { title: t('financeiro.valor'), key: 'valor' },
  { title: t('financeiro.vencimento'), key: 'dtVencimento' },
  { title: 'Data de Recebimento', key: 'dtRecebimento' },
  { title: t('financeiro.status'), key: 'status' },
  { title: t('common.actions'), key: 'actions', sortable: false },
])

const {
  columns,
  visibleColumns,
  selectAllColumns,
  resetColumns,
  filteredHeaders,
} = useColumnManager('crm.columns.contas-receber', [
  { key: 'id', label: 'ID', defaultVisible: false },
  { key: 'cliente', label: 'Cliente' },
  { key: 'clienteEmail', label: 'Email Cliente', defaultVisible: false },
  { key: 'descricao', label: 'Descrição' },
  { key: 'valor', label: 'Valor' },
  { key: 'dtVencimento', label: 'Vencimento' },
  { key: 'dtRecebimento', label: 'Data de Recebimento', defaultVisible: false },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Ações', locked: true },
])

const headers = computed(() => filteredHeaders(baseHeaders.value))

const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return items.value

  return items.value.filter((item) => {
    const text = [
      item.id,
      item.cliente?.nome,
      item.cliente?.email,
      item.descricao,
      item.valor,
      item.dtVencimento,
      item.dtRecebimento,
      item.status,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return text.includes(term)
  })
})

function getStatusColor(status: string) {
  if (status === 'PAGO') return 'green'
  if (status === 'PENDENTE') return 'orange'
  return 'grey'
}

const formatCurrency = (value: number | string | undefined) => {
  if (value === undefined || value === null || (typeof value === 'number' && isNaN(value))) return '-'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('pt-BR')
}

function openNew() {
  isEditing.value = false
  editingId.value = null
  formItem.value = { descricao: '', valor: '', dtVencimento: '', clienteId: '' }
  dialog.value = true
}

function openEdit(item: any) {
  isEditing.value = true
  editingId.value = item.id
  formItem.value = {
    descricao: item.descricao,
    valor: String(item.valor),
    dtVencimento: item.dtVencimento,
    clienteId: item.clienteId || '',
  }
  dialog.value = true
}

async function save() {
  if (!formItem.value.descricao || !formItem.value.valor || !formItem.value.dtVencimento) {
    showSnackbar('Preencha todos os campos', 'warning')
    return
  }

  const valorFormatado = String(formItem.value.valor).replace(',', '.')
  const valorNumero = Number(valorFormatado)

  if (isNaN(valorNumero)) {
    showSnackbar('Valor inválido', 'error')
    return
  }

  const payload = {
    descricao: formItem.value.descricao,
    valor: valorNumero,
    dtVencimento: formItem.value.dtVencimento,
    clienteId: formItem.value.clienteId || undefined,
  }

  const result = isEditing.value && editingId.value
    ? await store.updateContaReceber(editingId.value, payload)
    : await store.createContaReceber(payload)

  if (result.success) {
    dialog.value = false
    formItem.value = { descricao: '', valor: '', dtVencimento: '', clienteId: '' }
    showSnackbar('Conta salva com sucesso!', 'success')
  } else {
    showSnackbar(result.message || 'Erro ao salvar conta', 'error')
  }
}

async function notify(item: any) {
  openConfirmDialog('Enviar Notificação', `Deseja enviar notificação para ${item.descricao}?`, async () => {
    const success = await store.notifyConta(item.id)
    showSnackbar(success ? 'Notificação enviada com sucesso!' : 'Erro ao enviar notificação.', success ? 'success' : 'error')
  })
}

async function markAsReceived(item: any) {
  openConfirmDialog('Confirmar Recebimento', `Confirmar recebimento de ${item.descricao}?`, async () => {
    await store.receiveConta(item.id)
    showSnackbar('Recebimento confirmado!', 'success')
  })
}

onMounted(() => {
  store.fetchContasReceber()
  clientesStore.carregarClientes()
})

watch(() => store.error, (newVal) => {
  if (newVal) showSnackbar(newVal, 'error')
})
</script>

<style scoped>
.page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.title-wrap {
  min-width: 0;
}

.page-header h2 {
  margin: 0;
  color: #111827;
}

.subtitle {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.search-field {
  width: 300px;
}

.table-card {
  border-radius: 16px;
}

.search-popover {
  border-radius: 12px;
}

.mobile-list {
  display: grid;
  gap: 0.7rem;
}

.mobile-item {
  border-radius: 14px;
  border: 1px solid #d7e3f5;
  padding: 0.9rem;
}

.mobile-item-head {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  align-items: flex-start;
}

.mobile-name {
  margin: 0;
  font-size: 1rem;
  color: #193a66;
}

.mobile-item-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
  margin-top: 0.7rem;
}

.mobile-label {
  margin: 0;
  font-size: 0.72rem;
  color: #6b7f9a;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.mobile-value {
  margin: 0.12rem 0 0;
  font-weight: 600;
  color: #223b5b;
}

.mobile-actions {
  margin-top: 0.8rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .title-wrap {
    flex: 1 1 auto;
  }

  .page-header h2 {
    font-size: clamp(1.45rem, 7vw, 2rem);
    line-height: 1.05;
    white-space: nowrap;
  }

  .header-actions {
    flex-direction: row;
    width: 100%;
    align-items: center;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.2rem;
  }

  .header-actions :deep(.v-btn),
  .header-actions :deep(.v-menu),
  .header-actions :deep(.column-manager-menu) {
    flex-shrink: 0;
  }

  .header-actions .action-btn {
    min-width: max-content;
  }
}
</style>
