<template>
  <v-container fluid class="page">
    <div class="page-header" :class="{ 'mobile-header': mobile }">
      <div class="header-main">
        <div>
          <h2 class="page-title">Clientes</h2>
          <p v-if="!mobile" class="subtitle">Gerencie seus clientes cadastrados</p>
        </div>
        <div v-if="mobile" class="header-main-actions d-flex ga-2">
          <v-btn
            variant="flat"
            color="success"
            icon="mdi-file-excel"
            :loading="importandoCsv"
            class="text-none"
            @click="abrirImportadorCsv"
          />
          <v-btn color="primary" to="/clientes/novo" icon="mdi-plus" flat />
        </div>
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
            <v-btn v-bind="props" icon variant="tonal" class="action-icon-btn" aria-label="Pesquisar">
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
        <template v-if="!mobile">
          <v-btn
            variant="flat"
            color="success"
            prepend-icon="mdi-file-excel"
            :loading="importandoCsv"
            class="text-none action-btn"
            @click="abrirImportadorCsv"
          >
            Importar CSV
          </v-btn>
          <v-btn color="primary" to="/clientes/novo" class="text-none action-btn">+ Criar Novo</v-btn>
        </template>
      </div>
    </div>


    <input
      ref="csvInputRef"
      type="file"
      accept=".csv,text/csv"
      class="hidden-input"
      @change="importarClientesCsv"
    />

    <v-card elevation="2" class="table-card">
      <v-card-text>
        <v-skeleton-loader
          v-if="carregando"
          type="table-heading, table-row-divider@6"
          class="bg-transparent"
        ></v-skeleton-loader>

        <template v-else>
          <div v-if="mobile && filteredClientes.length > 0" class="mobile-list">
            <v-card
              v-for="cliente in filteredClientes"
              :key="cliente.id"
              class="mobile-item"
              elevation="1"
              @click="irParaCliente(cliente.id)"
            >
              <div class="mobile-item-head">
                <div>
                  <p class="mobile-code">#{{ cliente.codigo !== undefined && cliente.codigo !== null ? String(cliente.codigo).padStart(3, '0') : '---' }}</p>
                  <h3 class="mobile-name">{{ cliente.nome }}</h3>
                </div>
                <v-chip :color="cliente.isAtivo ? 'blue' : 'grey-lighten-2'" size="small" variant="flat">
                  {{ cliente.isAtivo ? 'Ativo' : 'Inativo' }}
                </v-chip>
              </div>
              <p class="mobile-meta">{{ cliente.email || '-' }}</p>
              <p class="mobile-meta">{{ formatTelefone(cliente.telefone) || '-' }}</p>
              <div class="mobile-actions">
                <v-btn size="small" variant="tonal" color="primary" @click.stop="irParaEdicao(cliente.id)">Editar</v-btn>
                <v-btn
                  size="small"
                  variant="tonal"
                  :color="cliente.isAtivo ? 'warning' : 'success'"
                  @click.stop="abrirConfirmacaoStatus(cliente.id, cliente.isAtivo)"
                >
                  {{ cliente.isAtivo ? 'Inativar' : 'Ativar' }}
                </v-btn>
                <v-btn size="small" variant="tonal" color="error" @click.stop="abrirConfirmacaoExcluir(cliente.id)">Excluir</v-btn>
              </div>
            </v-card>
          </div>

          <v-table class="table" v-else-if="filteredClientes.length > 0">
            <thead>
              <tr>
                <th v-if="isColumnVisible('codigo')">Código</th>
                <th v-if="isColumnVisible('nome')">Nome</th>
                <th v-if="isColumnVisible('email')">Email</th>
                <th v-if="isColumnVisible('tipoPessoa')">Tipo de Pessoa</th>
                <th v-if="isColumnVisible('telefone')">Telefone</th>
                <th v-if="isColumnVisible('documento')">Documento</th>
                <th v-if="isColumnVisible('tipoCliente')">Tipo de Cliente</th>
                <th v-if="isColumnVisible('origem')">Origem</th>
                <th v-if="isColumnVisible('pipelineStage')">Etapa do Funil</th>
                <th v-if="isColumnVisible('temperatura')">Temperatura</th>
                <th v-if="isColumnVisible('dataUltimaInteracao')">Última Interação</th>
                <th v-if="isColumnVisible('status')">Status</th>
                <th v-if="isColumnVisible('acoes')">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="cliente in paginatedClientes"
                :key="cliente.id"
                class="clickable-row"
                role="button"
                tabindex="0"
                @click="irParaCliente(cliente.id)"
                @keydown.enter.prevent="irParaCliente(cliente.id)"
                @keydown.space.prevent="irParaCliente(cliente.id)"
              >
                <td v-if="isColumnVisible('codigo')">#{{ cliente.codigo !== undefined && cliente.codigo !== null ? String(cliente.codigo).padStart(3, '0') : '---' }}</td>
                <td v-if="isColumnVisible('nome')">{{ cliente.nome }}</td>
                <td v-if="isColumnVisible('email')">{{ cliente.email || '-' }}</td>
                <td v-if="isColumnVisible('tipoPessoa')">{{ formatTipoPessoa(cliente.tipoPessoa) }}</td>
                <td v-if="isColumnVisible('telefone')">{{ formatTelefone(cliente.telefone) || '-' }}</td>
                <td v-if="isColumnVisible('documento')">{{ cliente.documento || '-' }}</td>
                <td v-if="isColumnVisible('tipoCliente')">{{ cliente.tipoCliente || '-' }}</td>
                <td v-if="isColumnVisible('origem')">{{ cliente.origem || '-' }}</td>
                <td v-if="isColumnVisible('pipelineStage')">{{ cliente.pipelineStage || '-' }}</td>
                <td v-if="isColumnVisible('temperatura')">
                  <v-chip
                    v-if="cliente.temperatura"
                    :color="getTemperaturaColor(cliente.temperatura)"
                    size="small"
                    variant="flat"
                    class="font-weight-bold"
                  >
                    {{ cliente.temperatura }}
                  </v-chip>
                  <span v-else>-</span>
                </td>
                <td v-if="isColumnVisible('dataUltimaInteracao')">{{ formatDate(cliente.dataUltimaInteracao) }}</td>
                <td v-if="isColumnVisible('status')">
                  <v-chip :color="cliente.isAtivo ? 'blue' : 'grey-lighten-2'" size="small" variant="flat">
                    {{ cliente.isAtivo ? 'Ativo' : 'Inativo' }}
                  </v-chip>
                </td>
                <td v-if="isColumnVisible('acoes')">
                  <v-menu>
                    <template #activator="{ props }">
                      <v-btn
                        icon
                        variant="text"
                        size="small"
                        v-bind="props"
                        @click.stop
                      >
                        <v-icon icon="mdi-dots-vertical" />
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item title="Editar" @click.stop="irParaEdicao(cliente.id)" />
                      <v-list-item
                        :title="cliente.isAtivo ? 'Inativar' : 'Ativar'"
                        @click.stop="abrirConfirmacaoStatus(cliente.id, cliente.isAtivo)"
                      />
                      <v-list-item title="Excluir" @click.stop="abrirConfirmacaoExcluir(cliente.id)" />
                    </v-list>
                  </v-menu>
                </td>
              </tr>
            </tbody>
          </v-table>

          <div v-if="filteredClientes.length > 0" class="d-flex align-center justify-end px-4 py-2 border-t text-body-2">
            <div class="d-flex align-center mr-4">
              <span class="text-grey-darken-1 mr-2">Itens por página:</span>
              <v-select
                v-model="itemsPerPage"
                :items="[10, 25, 50, 100]"
                variant="outlined"
                density="compact"
                hide-details
                class="items-per-page-select"
              />
            </div>
            
            <span class="text-grey-darken-1 mr-4">
              {{ paginationText }}
            </span>

            <div class="d-flex align-center">
              <v-btn
                icon="mdi-chevron-left"
                variant="text"
                density="comfortable"
                :disabled="page === 1"
                @click="page--"
              />
              <v-btn
                icon="mdi-chevron-right"
                variant="text"
                density="comfortable"
                :disabled="page * itemsPerPage >= filteredClientes.length"
                @click="page++"
              />
            </div>
          </div>

          <div v-if="filteredClientes.length === 0" class="empty-state">
            <v-icon icon="mdi-account-group" size="64" color="grey-lighten-1" class="mb-4" />
            <p class="text-h6 text-grey-darken-1 mb-2">Você ainda não tem Clientes</p>
            <p class="text-body-2 text-grey mb-6">Cadastre seu primeiro cliente aqui</p>
            <v-btn color="primary" to="/clientes/novo" prepend-icon="mdi-plus">
              Criar Novo
            </v-btn>
          </div>
        </template>
      </v-card-text>
    </v-card>

    <v-dialog v-model="confirmarExcluir" max-width="440">
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon icon="delete" color="error" />
          Confirmar exclusão
        </v-card-title>
        <v-card-text>Tem certeza que deseja excluir este cliente? Essa ação não poderá ser desfeita.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="tonal" color="grey" @click="confirmarExcluir = false">Cancelar</v-btn>
          <v-btn color="error" @click="confirmarExclusao">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmarStatus" max-width="440">
      <v-card>
        <v-card-title class="d-flex align-center ga-2">
          <v-icon :icon="statusAtual ? 'toggle_off' : 'toggle_on'" color="primary" />
          {{ statusAtual ? 'Inativar cliente' : 'Ativar cliente' }}
        </v-card-title>
        <v-card-text>
          {{ statusAtual ? 'Deseja inativar este cliente?' : 'Deseja ativar este cliente?' }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="tonal" color="grey" @click="confirmarStatus = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmarAlterarStatus">
            {{ statusAtual ? 'Inativar' : 'Ativar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useClientesStore } from '../../stores/clientesStore'
import { formatTelefone } from '../../utils/formatters'
import { PESSOA_TIPO_OPTIONS, PessoaTipoEnum } from '../../types/enums/pessoa-tipo.enum'
import ColumnManagerMenu from '../../components/common/ColumnManagerMenu.vue'
import { useColumnManager } from '../../composables/useColumnManager'
import { notificationsStore } from '../../stores/notificationsStore'

const router = useRouter()
const { mobile } = useDisplay()
const { clientes, carregarClientes, deletarCliente, atualizarCliente, adicionarCliente, carregando } = useClientesStore()
const search = ref('')
const searchMenu = ref(false)
const csvInputRef = ref<HTMLInputElement | null>(null)
const importandoCsv = ref(false)

const {
  columns,
  visibleColumns,
  isColumnVisible,
  selectAllColumns,
  resetColumns,
} = useColumnManager('crm.columns.clientes', [
  { key: 'codigo', label: 'Código' },
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'tipoPessoa', label: 'Tipo de Pessoa' },
  { key: 'telefone', label: 'Telefone' },
  { key: 'documento', label: 'Documento', defaultVisible: false },
  { key: 'tipoCliente', label: 'Tipo de Cliente', defaultVisible: false },
  { key: 'origem', label: 'Origem', defaultVisible: false },
  { key: 'pipelineStage', label: 'Etapa do Funil', defaultVisible: false },
  { key: 'temperatura', label: 'Temperatura', defaultVisible: false },
  { key: 'dataUltimaInteracao', label: 'Última Interação', defaultVisible: false },
  { key: 'status', label: 'Status' },
  { key: 'acoes', label: 'Ações', locked: true },
])

const filteredClientes = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return clientes.value

  return clientes.value.filter((cliente) => {
    const text = [
      cliente.codigo,
      cliente.nome,
      cliente.email,
      cliente.telefone,
      cliente.documento,
      cliente.tipoCliente,
      cliente.origem,
      cliente.pipelineStage,
      cliente.temperatura,
      cliente.interesse,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return text.includes(term)
  })
})

const page = ref(1)
const itemsPerPage = ref(10)

const paginatedClientes = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredClientes.value.slice(start, end)
})

const paginationText = computed(() => {
  const total = filteredClientes.value.length
  if (total === 0) return '0-0 de 0'
  const start = (page.value - 1) * itemsPerPage.value + 1
  const end = Math.min(page.value * itemsPerPage.value, total)
  return `${start}-${end} de ${total}`
})

const confirmarExcluir = ref(false)
const confirmarStatus = ref(false)
const clienteSelecionado = ref<string | null>(null)
const statusAtual = ref<boolean>(true)

const irParaCliente = (id: string) => {
  router.push(`/clientes/${id}`)
}

const irParaEdicao = (id: string) => {
  router.push(`/clientes/${id}/editar`)
}

const abrirConfirmacaoExcluir = (id: string) => {
  clienteSelecionado.value = id
  confirmarExcluir.value = true
}

const confirmarExclusao = async () => {
  if (clienteSelecionado.value) {
    await deletarCliente(clienteSelecionado.value)
  }
  confirmarExcluir.value = false
}

const abrirConfirmacaoStatus = (id: string, isAtivo?: boolean) => {
  clienteSelecionado.value = id
  statusAtual.value = Boolean(isAtivo)
  confirmarStatus.value = true
}

const confirmarAlterarStatus = async () => {
  if (clienteSelecionado.value) {
    await atualizarCliente(clienteSelecionado.value, { isAtivo: !statusAtual.value })
  }
  confirmarStatus.value = false
}

const formatTipoPessoa = (tipoPessoa: string) => {
  const option = PESSOA_TIPO_OPTIONS.find((opt) => opt.value === tipoPessoa)
  return option?.label || tipoPessoa
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const getTemperaturaColor = (temperatura?: string) => {
  if (!temperatura) return 'grey'
  const temp = temperatura.toLowerCase()
  if (temp.includes('quente')) return 'red'
  if (temp.includes('morna')) return 'orange'
  if (temp.includes('fria')) return 'blue-lighten-3'
  return 'grey-lighten-1'
}

const abrirImportadorCsv = () => {
  csvInputRef.value?.click()
}

const parseCsvLine = (line: string) => {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  result.push(current.trim())
  return result
}

const mapTipoPessoa = (tipoRaw?: string): PessoaTipoEnum => {
  const value = (tipoRaw || '').trim().toUpperCase()
  if (value === 'JURIDICA' || value === 'JURÍDICA' || value === 'PJ') return PessoaTipoEnum.JURIDICA
  if (value === 'ESTRANGEIRA') return PessoaTipoEnum.ESTRANGEIRA
  return PessoaTipoEnum.FISICA
}

const mapBoolean = (raw?: string): boolean => {
  const value = (raw || '').trim().toLowerCase()
  return value === '1' || value === 'true' || value === 'sim' || value === 'ativo'
}

const importarClientesCsv = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  importandoCsv.value = true

  try {
    const content = await file.text()
    const lines = content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length < 2) {
      notificationsStore.notify('A planilha CSV não possui dados para importar.', 'warning')
      return
    }

    const headers = parseCsvLine(lines[0] || '').map((h) => h.toLowerCase())
    const idx = (name: string) => headers.indexOf(name)

    const idxNome = idx('nome')
    const idxEmail = idx('email')
    const idxTelefone = idx('telefone')
    const idxTipoPessoa = idx('tipopessoa')
    const idxDtNascimento = idx('dtnascimento')
    const idxDocumento = idx('documento')
    const idxTipoCliente = idx('tipocliente')
    const idxObservacoes = idx('observacoes')
    const idxIsAtivo = idx('isativo')
    const idxOrigem = idx('origem')
    const idxInteresse = idx('interesse')
    const idxPipelineStage = idx('pipelinestage')
    const idxTemperatura = idx('temperatura')

    if (idxNome === -1 || idxEmail === -1 || idxTelefone === -1) {
      notificationsStore.notify('O CSV deve conter as colunas obrigatórias: nome,email,telefone.', 'error')
      return
    }

    let success = 0
    let failed = 0

    for (let i = 1; i < lines.length; i += 1) {
      const cols = parseCsvLine(lines[i] || '')
      const nome = cols[idxNome] || ''
      const email = cols[idxEmail] || ''
      const telefone = (cols[idxTelefone] || '').replace(/\D/g, '')

      if (!nome || !email || !telefone) {
        failed += 1
        continue
      }

      try {
        await adicionarCliente({
          nome,
          email,
          telefone,
          tipoPessoa: mapTipoPessoa(cols[idxTipoPessoa]),
          dtNascimento: cols[idxDtNascimento] || '',
          documento: cols[idxDocumento] || '',
          tipoCliente: cols[idxTipoCliente] || '',
          observacoes: cols[idxObservacoes] || '',
          isAtivo: idxIsAtivo === -1 ? true : mapBoolean(cols[idxIsAtivo]),
          origem: cols[idxOrigem] || '',
          interesse: cols[idxInteresse] || '',
          pipelineStage: cols[idxPipelineStage] || 'NOVO',
          temperatura: cols[idxTemperatura] || 'FRIA',
        })
        success += 1
      } catch (_error) {
        failed += 1
      }
    }

    await carregarClientes()
    notificationsStore.notify(`Importação finalizada. Sucesso: ${success} | Falhas: ${failed}`, failed ? 'warning' : 'success')
  } catch (_error) {
    notificationsStore.notify('Não foi possível processar o arquivo CSV.', 'error')
  } finally {
    importandoCsv.value = false
    target.value = ''
  }
}

onMounted(() => {
  carregarClientes()
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

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.search-field {
  width: 300px;
}

.hidden-input {
  display: none;
}

.search-popover {
  border-radius: 12px;
}

.page-header h2 {
  margin: 0;
}

.subtitle {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
}

.table-card {
  border-radius: 16px;
}

.mobile-list {
  display: grid;
  gap: 0.7rem;
}

.mobile-item {
  border-radius: 14px;
  padding: 0.85rem;
  border: 1px solid #d7e3f5;
}

.mobile-item-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.6rem;
}

.mobile-code {
  margin: 0;
  font-size: 0.75rem;
  color: #667a96;
}

.mobile-name {
  margin: 0.15rem 0 0;
  font-size: 1.04rem;
  color: #173a66;
  line-height: 1.2;
}

.mobile-meta {
  margin: 0.32rem 0 0;
  color: #4e6482;
  font-size: 0.87rem;
}

.mobile-actions {
  display: flex;
  gap: 0.45rem;
  margin-top: 0.8rem;
  flex-wrap: wrap;
}

.clickable-row {
  cursor: pointer;
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
  .header-actions {
    padding-bottom: 0.2rem;
  }

  .header-actions :deep(.v-btn),
  .header-actions :deep(.v-menu),
  .header-actions :deep(.column-manager-menu) {
    flex-shrink: 0;
  }
}

.items-per-page-select {
  width: 80px;
}

.items-per-page-select :deep(.v-field__input) {
  min-height: 32px;
  padding-top: 0;
  padding-bottom: 0;
}

.border-t {
  border-top: 1px solid #e0e0e0;
}
</style>
