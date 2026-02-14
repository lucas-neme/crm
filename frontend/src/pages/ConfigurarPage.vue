<template>
  <v-container fluid class="page">
    <div class="page-header">
      <div>
        <h2>Configurações do CRM</h2>
        <p class="subtitle">Personalize identidade, tipo de CRM e permissões de acesso</p>
      </div>
    </div>

    <v-tabs v-model="activeTab" class="mb-4" color="primary">
      <v-tab value="geral">Geral</v-tab>
      <v-tab value="usuarios">Usuários</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="geral">
        <v-form @submit.prevent="salvar">
          <v-row>
            <v-col cols="12" md="8">
              <v-card elevation="2" class="form-card mb-4">
                <v-card-title class="section-title">Identidade da Empresa</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="8">
                      <v-text-field v-model="form.nomeCRM" label="Nome do CRM" required />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model="form.cnpj"
                        label="CNPJ"
                        @update:model-value="onCnpjInput"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field v-model="form.website" label="Site" />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <v-card elevation="2" class="form-card mb-4">
                <v-card-title class="section-title">Contato</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field v-model="form.email" label="Email de contato" type="email" />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="form.telefone"
                        label="Telefone"
                        @update:model-value="onTelefoneInput"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <v-card elevation="2" class="form-card mb-4">
                <v-card-title class="section-title">Endereço</v-card-title>
                <v-card-text>
                  <v-textarea
                    v-model="form.endereco"
                    label="Endereço completo"
                    rows="3"
                    auto-grow
                    hide-details="auto"
                  />
                </v-card-text>
              </v-card>

              <v-card elevation="2" class="form-card mb-4">
                <v-card-title class="section-title">Configurações de Módulos</v-card-title>
                <v-card-text>
                  <v-alert
                    v-if="erroModulo"
                    type="error"
                    variant="tonal"
                    class="mb-3"
                    density="comfortable"
                  >
                    {{ erroModulo }}
                  </v-alert>
                  <v-row>
                    <v-col cols="12" md="8">
                      <v-select
                        v-model="produtoModulo"
                        :items="[
                          { title: 'Padrão', value: 'PADRAO' },
                          { title: 'Imobiliária', value: 'IMOBILIARIA' }
                        ]"
                        item-title="title"
                        item-value="value"
                        label="Tipo de CRM"
                        hint="Define o tipo de CRM utilizado"
                        persistent-hint
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <div class="form-actions mt-4">
                <v-btn color="primary" type="submit">Salvar</v-btn>
                <v-btn variant="tonal" to="/">Cancelar</v-btn>
              </div>
            </v-col>

            <v-col cols="12" md="4" class="logo-column">
              <v-card elevation="2" class="form-card logo-card">
                <v-card-title class="section-title">Logo do CRM</v-card-title>
                <v-card-text class="logo-card-content">
                  <input
                    ref="logoInput"
                    type="file"
                    accept="image/*"
                    class="logo-input"
                    @change="handleLogoUpload"
                  />

                  <div v-if="!form.logoUrl && !previewUrl" class="logo-section">
                    <p class="logo-title">Adicione a identidade visual da empresa</p>
                    <div class="logo-empty-state">
                      <v-icon icon="mdi-image-plus" size="24" color="primary" />
                      <p>Envie uma imagem para começar</p>
                    </div>
                    <v-btn color="primary" variant="flat" block @click="abrirSeletorLogo">Selecionar logo</v-btn>
                  </div>

                  <div v-else class="logo-section">
                    <div class="d-flex align-center justify-space-between mb-2">
                      <p class="logo-title mb-0">{{ editandoLogo ? 'Editar logo' : 'Logo atual' }}</p>
                      <v-btn
                        :icon="editandoLogo ? 'mdi-close' : 'mdi-pencil'"
                        size="small"
                        variant="text"
                        color="primary"
                        @click="editandoLogo ? cancelarEdicaoLogo() : iniciarEdicaoLogo()"
                      />
                    </div>

                    <div
                      class="logo-preview-circle logo-draggable mx-auto"
                      :class="{ 'is-dragging': isDraggingLogo, 'is-editing': editandoLogo }"
                      @pointerdown="editandoLogo ? onLogoPointerDown($event) : undefined"
                      @pointermove="editandoLogo ? onLogoPointerMove($event) : undefined"
                      @pointerup="editandoLogo ? onLogoPointerUp($event) : undefined"
                      @pointercancel="editandoLogo ? onLogoPointerUp($event) : undefined"
                      @pointerleave="editandoLogo ? onLogoPointerUp($event) : undefined"
                    >
                      <img
                        :src="previewUrl || form.logoUrl"
                        alt="Preview do Logo"
                        class="logo-img"
                        draggable="false"
                        :style="logoPreviewStyle"
                      />
                    </div>

                    <div v-if="editandoLogo" class="logo-toolbar">
                      <v-btn color="primary" variant="tonal" @click="abrirSeletorLogo">
                        <v-icon icon="mdi-image-edit" class="mr-2" />
                        Alterar
                      </v-btn>
                      <v-btn color="error" variant="tonal" @click="removerLogo">
                        <v-icon icon="mdi-delete" class="mr-2" />
                        Remover
                      </v-btn>
                    </div>

                    <div class="logo-preview mt-4">
                      <p class="preview-label">Preview</p>
                      <p v-if="editandoLogo" class="preview-helper">Arraste a imagem para ajustar a posição.</p>
                      <v-slider
                        v-model="form.logoScale"
                        label="Zoom do logo"
                        min="50"
                        max="200"
                        step="1"
                        hide-details
                        class="mt-2"
                        :disabled="!editandoLogo"
                      />
                      <v-btn
                        variant="text"
                        size="small"
                        class="mt-1"
                        :disabled="!editandoLogo"
                        @click="resetarPosicaoLogo"
                      >
                        Recentralizar imagem
                      </v-btn>
                    </div>

                    <div v-if="editandoLogo" class="logo-footer-actions">
                      <v-btn color="primary" variant="flat" @click="salvarEdicaoLogo">Salvar logo</v-btn>
                      <v-btn variant="outlined" @click="cancelarEdicaoLogo">Cancelar</v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <v-card elevation="2" class="form-card logo-card mt-4">
                <v-card-title class="section-title">Foto do Proprietário</v-card-title>
                <v-card-text class="logo-card-content">
                  <input
                    ref="ownerPhotoInput"
                    type="file"
                    accept="image/*"
                    class="logo-input"
                    @change="handleOwnerPhotoUpload"
                  />

                  <div v-if="!form.ownerPhotoUrl && !ownerPreviewUrl" class="logo-section">
                    <p class="logo-title">Adicione a foto principal do proprietário</p>
                    <div class="logo-empty-state">
                      <v-icon icon="mdi-account-box-plus-outline" size="24" color="primary" />
                      <p>Envie uma foto para exibir na tela de login</p>
                    </div>
                    <v-btn color="primary" variant="flat" block @click="abrirSeletorOwnerPhoto">Selecionar foto</v-btn>
                  </div>

                  <div v-else class="logo-section">
                    <p class="logo-title mb-2">Foto atual</p>
                    <v-img
                      :src="ownerPreviewUrl || form.ownerPhotoUrl"
                      height="240"
                      cover
                      class="owner-photo-preview"
                    />
                    <v-text-field
                      v-model="form.ownerName"
                      label="Nome do proprietário"
                      class="mt-3"
                    />
                    <div class="logo-toolbar">
                      <v-btn color="primary" variant="tonal" @click="abrirSeletorOwnerPhoto">
                        <v-icon icon="mdi-image-edit-outline" class="mr-2" />
                        Alterar
                      </v-btn>
                      <v-btn color="error" variant="tonal" @click="removerOwnerPhoto">
                        <v-icon icon="mdi-delete-outline" class="mr-2" />
                        Remover
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-window-item>

      <v-window-item value="usuarios">
        <v-card elevation="2" class="form-card">
          <v-card-title class="section-title">Gestão de Usuários e Permissões</v-card-title>
          <v-card-text>
            <v-alert type="info" variant="tonal" class="mb-4">
              Aprove, ative/desative usuários e controle permissões de leitura, criação, edição e exclusão por módulo.
            </v-alert>

            <v-data-table :headers="userHeaders" :items="usersStore.users" :loading="usersStore.loading">
              <template #item.status="{ item }">
                <v-chip :color="item.isActive ? 'success' : 'warning'" size="small" variant="flat">
                  {{ item.isActive ? 'Aprovado/Ativo' : 'Pendente/Inativo' }}
                </v-chip>
              </template>

              <template #item.actions="{ item }">
                <v-btn
                  size="small"
                  variant="tonal"
                  color="primary"
                  class="mr-2"
                  @click="openPermissions(item)"
                >Permissões</v-btn>

                <v-btn
                  v-if="!item.isActive"
                  size="small"
                  color="success"
                  variant="flat"
                  @click="usersStore.approveUser(item.id)"
                >Aprovar</v-btn>

                <v-btn
                  v-else
                  size="small"
                  color="error"
                  variant="flat"
                  @click="usersStore.revokeUser(item.id)"
                >Revogar</v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>

    <v-dialog v-model="permissionsDialog" max-width="980">
      <v-card>
        <v-card-title>Permissões de {{ selectedUser?.name || selectedUser?.email }}</v-card-title>
        <v-card-text>
          <v-table density="compact">
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Leitura</th>
                <th>Criação</th>
                <th>Edição</th>
                <th>Exclusão</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="module in permissionModules" :key="module.key">
                <td>{{ module.label }}</td>
                <td><v-checkbox v-model="editablePermissions[module.key].read" hide-details density="compact" /></td>
                <td><v-checkbox v-model="editablePermissions[module.key].create" hide-details density="compact" /></td>
                <td><v-checkbox v-model="editablePermissions[module.key].update" hide-details density="compact" /></td>
                <td><v-checkbox v-model="editablePermissions[module.key].delete" hide-details density="compact" /></td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="permissionsDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="savePermissions">Salvar permissões</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-overlay :model-value="salvando" class="align-center justify-center">
      <v-progress-circular indeterminate color="primary" size="48" />
    </v-overlay>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useBrandingStore } from '../stores/brandingStore'
import { useModulesStore } from '../stores/modulesStore'
import { useUsersStore } from '../stores/usersStore'
import { notificationsStore } from '../stores/notificationsStore'
import { maskCNPJ, maskPhone } from '../utils/formatters'

const { branding, salvarBranding } = useBrandingStore()
const modulesStore = useModulesStore()
const usersStore = useUsersStore()

const activeTab = ref('geral')
const logoInput = ref<HTMLInputElement | null>(null)
const ownerPhotoInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string>('')
const ownerPreviewUrl = ref<string>('')
const salvando = ref(false)
const editandoLogo = ref(false)
const isDraggingLogo = ref(false)
const produtoModulo = ref('PADRAO')
const erroModulo = ref('')
const dragStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 })
const logoSnapshot = ref({
  logoUrl: '',
  logoScale: 100,
  logoOffsetX: 0,
  logoOffsetY: 0,
})

const permissionsDialog = ref(false)
const selectedUser = ref<any>(null)
const editablePermissions = ref<Record<string, any>>({})

const permissionModules = [
  { key: 'clientes', label: 'Clientes' },
  { key: 'leads', label: 'Leads' },
  { key: 'produtos', label: 'Produtos' },
  { key: 'negocios', label: 'Negócios' },
  { key: 'imoveis', label: 'Empreendimentos' },
  { key: 'reservas', label: 'Reservas' },
  { key: 'financeiro', label: 'Financeiro' },
  { key: 'configuracoes', label: 'Configurações' },
]

const userHeaders = [
  { title: 'Nome', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'actions', sortable: false },
]

const form = ref({
  nomeCRM: branding.value.nomeCRM,
  logoUrl: branding.value.logoUrl,
  ownerPhotoUrl: branding.value.ownerPhotoUrl || '/assets/images/owners/owner-main.png',
  ownerName: branding.value.ownerName || 'Proprietário do CRM',
  logoScale: branding.value.logoScale,
  logoOffsetX: branding.value.logoOffsetX || 0,
  logoOffsetY: branding.value.logoOffsetY || 0,
  email: branding.value.email,
  telefone: branding.value.telefone,
  endereco: branding.value.endereco,
  website: branding.value.website,
  cnpj: branding.value.cnpj,
})

onMounted(async () => {
  await modulesStore.fetchConfig()
  produtoModulo.value = modulesStore.produtoModulo === 'IMOBILIARIA' ? 'IMOBILIARIA' : 'PADRAO'
  await usersStore.fetchUsers()
})

const logoPreviewStyle = computed(() => ({
  transform: `translate(${form.value.logoOffsetX || 0}px, ${form.value.logoOffsetY || 0}px) scale(${form.value.logoScale / 100})`,
}))

const abrirSeletorLogo = () => {
  logoInput.value?.click()
}

const abrirSeletorOwnerPhoto = () => {
  ownerPhotoInput.value?.click()
}

const removerLogo = () => {
  form.value.logoUrl = ''
  form.value.logoOffsetX = 0
  form.value.logoOffsetY = 0
  previewUrl.value = ''
  if (logoInput.value) {
    logoInput.value.value = ''
  }
  editandoLogo.value = true
}

const iniciarEdicaoLogo = () => {
  logoSnapshot.value = {
    logoUrl: form.value.logoUrl || '',
    logoScale: form.value.logoScale || 100,
    logoOffsetX: form.value.logoOffsetX || 0,
    logoOffsetY: form.value.logoOffsetY || 0,
  }
  editandoLogo.value = true
}

const cancelarEdicaoLogo = () => {
  form.value.logoUrl = logoSnapshot.value.logoUrl
  form.value.logoScale = logoSnapshot.value.logoScale
  form.value.logoOffsetX = logoSnapshot.value.logoOffsetX
  form.value.logoOffsetY = logoSnapshot.value.logoOffsetY
  previewUrl.value = logoSnapshot.value.logoUrl
  editandoLogo.value = false
}

const salvarEdicaoLogo = () => {
  salvarBranding({
    logoUrl: form.value.logoUrl,
    logoScale: form.value.logoScale,
    logoOffsetX: form.value.logoOffsetX,
    logoOffsetY: form.value.logoOffsetY,
  })
  editandoLogo.value = false
  notificationsStore.notify('Logo atualizada com sucesso.', 'success')
}

const handleLogoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
      form.value.logoUrl = e.target?.result as string
      form.value.logoOffsetX = 0
      form.value.logoOffsetY = 0
      editandoLogo.value = true
    }
    reader.readAsDataURL(file)
  } else {
    previewUrl.value = ''
  }
}

const handleOwnerPhotoUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    ownerPreviewUrl.value = e.target?.result as string
    form.value.ownerPhotoUrl = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removerOwnerPhoto = () => {
  form.value.ownerPhotoUrl = ''
  ownerPreviewUrl.value = ''
  if (ownerPhotoInput.value) {
    ownerPhotoInput.value.value = ''
  }
}

const openPermissions = (user: any) => {
  selectedUser.value = user
  editablePermissions.value = JSON.parse(JSON.stringify(user.permissions || {}))

  permissionModules.forEach((module) => {
    if (!editablePermissions.value[module.key]) {
      editablePermissions.value[module.key] = {
        read: false,
        create: false,
        update: false,
        delete: false,
      }
    }
  })

  permissionsDialog.value = true
}

const savePermissions = async () => {
  if (!selectedUser.value) return
  await usersStore.savePermissions(selectedUser.value.id, editablePermissions.value)
  permissionsDialog.value = false
}

const onCnpjInput = (value: string) => {
  form.value.cnpj = maskCNPJ(value || '')
}

const onTelefoneInput = (value: string) => {
  form.value.telefone = maskPhone(value || '')
}

const salvar = async () => {
  salvando.value = true
  erroModulo.value = ''
  try {
    salvarBranding(form.value)
    const saved = await modulesStore.setProdutoModulo(produtoModulo.value)
    const confirmed = await modulesStore.fetchConfig()

    if (saved !== confirmed || confirmed !== produtoModulo.value) {
      throw new Error('O tipo de CRM não foi persistido corretamente.')
    }

    localStorage.setItem('crm.showSavedSnackbar', 'true')
    window.location.href = '/'
  } catch (error) {
    console.error(error)
    erroModulo.value = 'Não foi possível salvar o tipo de CRM. Tente novamente.'
    salvando.value = false
  }
}

const onLogoPointerDown = (event: PointerEvent) => {
  if (!form.value.logoUrl && !previewUrl.value) return
  isDraggingLogo.value = true
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    offsetX: form.value.logoOffsetX || 0,
    offsetY: form.value.logoOffsetY || 0,
  }
  const target = event.currentTarget as HTMLElement | null
  target?.setPointerCapture?.(event.pointerId)
}

const onLogoPointerMove = (event: PointerEvent) => {
  if (!isDraggingLogo.value) return
  const dx = event.clientX - dragStart.value.x
  const dy = event.clientY - dragStart.value.y
  form.value.logoOffsetX = dragStart.value.offsetX + dx
  form.value.logoOffsetY = dragStart.value.offsetY + dy
}

const onLogoPointerUp = (event: PointerEvent) => {
  if (!isDraggingLogo.value) return
  isDraggingLogo.value = false
  const target = event.currentTarget as HTMLElement | null
  target?.releasePointerCapture?.(event.pointerId)
}

const resetarPosicaoLogo = () => {
  form.value.logoOffsetX = 0
  form.value.logoOffsetY = 0
}
</script>

<style scoped>
.page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.form-card {
  border-radius: 14px;
}

.logo-card {
  position: sticky;
  top: 0;
}

.logo-column {
  align-self: flex-start;
}

.logo-card-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.logo-preview {
  padding: 0.9rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: linear-gradient(180deg, #f9fbff 0%, #f4f7fb 100%);
}

.preview-label {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: #6b7280;
}

.logo-preview-circle {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  overflow: hidden;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

.logo-draggable {
  cursor: default;
  touch-action: none;
  user-select: none;
}

.logo-draggable.is-editing {
  cursor: grab;
}

.logo-draggable.is-dragging {
  cursor: grabbing;
}

.preview-helper {
  margin: 0.75rem 0 0;
  font-size: 0.8rem;
  color: #6b7280;
  text-align: center;
}

.logo-section {
  margin-bottom: 0.5rem;
}

.logo-title {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.logo-input {
  display: none;
}

.logo-empty-state {
  border: 1px dashed #c7d2e3;
  border-radius: 12px;
  padding: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #f8fbff;
  margin-bottom: 0.75rem;
}

.logo-empty-state p {
  margin: 0;
  color: #64748b;
  font-size: 0.86rem;
}

.logo-toolbar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.owner-photo-preview {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
}

.logo-footer-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
  margin-top: 0.2rem;
}
</style>
