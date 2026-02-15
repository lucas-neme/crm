<template>
  <v-container fluid class="page">
    <div class="page-header">
      <div>
        <h2>Configurações do CRM</h2>
        <p class="subtitle">
          Personalize identidade<span v-if="isSystemAdmin">, tipo de CRM e permissões de acesso</span>
        </p>
      </div>
    </div>

    <v-tabs v-model="activeTab" class="mb-4" color="primary">
      <v-tab value="geral">Geral</v-tab>
      <v-tab v-if="isSystemAdmin" value="admin">Administração</v-tab>
      <v-tab v-if="isSystemAdmin" value="usuarios">Usuários</v-tab>
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
                        placeholder="00.000.000/0000-00"
                        maxlength="18"
                        @update:model-value="onCnpjInput"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field v-model="form.website" label="Site" />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="form.slogan"
                        label="Slogan (aparece no login)"
                        hint="A frase que aparece abaixo do nome na tela de acesso."
                        persistent-hint
                      />
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
                        placeholder="(00) 00000-0000"
                        maxlength="15"
                        @update:model-value="onTelefoneInput"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>

              <v-card elevation="2" class="form-card mb-4">
                <v-card-title class="section-title">Endereço</v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="form.cep"
                        label="CEP"
                        placeholder="00000-000"
                        maxlength="9"
                        @update:model-value="onCepInput"
                        append-inner-icon="mdi-magnify"
                        @click:append-inner="buscarCep"
                        :loading="buscandoCep"
                      />
                    </v-col>
                    <v-col cols="12" md="7">
                      <v-text-field v-model="form.logradouro" label="Logradouro" placeholder="Ex: Rua das Flores" />
                    </v-col>
                    <v-col cols="12" md="2">
                      <v-text-field v-model="form.numero" label="Número" />
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field v-model="form.complemento" label="Complemento" placeholder="Ex: Sala 201" />
                    </v-col>
                    <v-col cols="12" md="5">
                      <v-text-field v-model="form.cidade" label="Cidade" />
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-select
                        v-model="form.uf"
                        :items="estados"
                        item-title="nome"
                        item-value="sigla"
                        label="Estado"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4" class="logo-column order-2">
              <v-card elevation="2" class="form-card logo-card">
                <v-card-title class="section-title d-flex align-center justify-space-between">
                  <span>Logo do CRM</span>
                  <div v-if="form.logoUrl || previewUrl" class="d-flex align-center">
                    <v-btn
                      v-if="!editandoLogo"
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      class="mr-1"
                      @click="removerLogo"
                    />
                    <v-btn
                      :icon="editandoLogo ? 'mdi-check' : 'mdi-pencil'"
                      size="small"
                      variant="text"
                      color="primary"
                      @click="editandoLogo ? concluirEdicaoLogo() : iniciarEdicaoLogo()"
                    />
                  </div>
                </v-card-title>
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
                        Alterar imagem
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
                        variant="tonal"
                        size="small"
                        class="mt-2 text-none btn-recenter"
                        :disabled="!editandoLogo"
                        @click="resetarPosicaoLogo"
                        density="compact"
                      >
                        Recentralizar imagem
                      </v-btn>
                    </div>

                    <div v-if="editandoLogo" class="logo-footer-actions">
                      <v-btn color="success" variant="flat" block class="text-none mt-4" @click="concluirEdicaoLogo">
                        <v-icon icon="mdi-check" class="mr-2" />
                        Concluir ajuste
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>

              <v-card elevation="2" class="form-card logo-card mt-4">
                <v-card-title class="section-title d-flex align-center justify-space-between">
                  <span>Foto de Capa</span>
                  <div v-if="form.ownerPhotoUrl || ownerPreviewUrl" class="d-flex align-center">
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      class="mr-1"
                      @click="removerOwnerPhoto"
                    />
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      color="primary"
                      @click="abrirSeletorOwnerPhoto"
                    />
                  </div>
                </v-card-title>
                <v-card-text class="logo-card-content">
                  <input
                    ref="ownerPhotoInput"
                    type="file"
                    accept="image/*"
                    class="logo-input"
                    @change="handleOwnerPhotoUpload"
                  />

                  <div v-if="!form.ownerPhotoUrl && !ownerPreviewUrl" class="logo-section">
                    <p class="logo-title">Adicione a foto de capa</p>
                    <div class="logo-empty-state">
                      <v-icon icon="mdi-account-box-plus-outline" size="24" color="primary" />
                      <p>Envie uma foto para exibir na tela de login</p>
                    </div>
                    <v-btn color="primary" variant="flat" block @click="abrirSeletorOwnerPhoto">Selecionar foto</v-btn>
                  </div>

                  <div v-else class="logo-section">
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
                    <v-textarea
                      v-model="form.ownerDescription"
                      label="Descrição/Frase do proprietário"
                      class="mt-2"
                      rows="3"
                      hide-details
                    />
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="8" class="order-3">
              <v-card elevation="2" class="form-card mb-4">
                <v-card-title class="section-title d-flex align-center">
                  <v-icon icon="mdi-shield-lock-outline" class="mr-2" color="primary" />
                  Segurança
                </v-card-title>
                <v-card-text>
                  <p class="text-body-2 text-grey-darken-1 mb-4">
                    Para sua segurança, você pode alterar sua senha de acesso a qualquer momento.
                  </p>
                  
                  <v-btn
                    v-if="!showPasswordChange"
                    variant="text"
                    color="primary"
                    class="text-none px-0"
                    prepend-icon="mdi-lock-reset"
                    @click="showPasswordChange = true"
                  >
                    Alterar minha senha
                  </v-btn>

                  <v-expand-transition>
                    <div v-if="showPasswordChange" class="mt-4">
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="personalPasswordForm.password"
                            label="Nova senha"
                            type="password"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-lock-outline"
                            hint="Mínimo de 6 caracteres"
                            persistent-hint
                          />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="personalPasswordForm.confirmPassword"
                            label="Confirmar nova senha"
                            type="password"
                            variant="outlined"
                            density="comfortable"
                            prepend-inner-icon="mdi-lock-check-outline"
                          />
                        </v-col>
                      </v-row>
                      <div class="d-flex justify-end mt-2">
                        <v-btn
                          variant="text"
                          class="text-none"
                          size="small"
                          @click="showPasswordChange = false; personalPasswordForm.password = ''; personalPasswordForm.confirmPassword = ''"
                        >
                          Cancelar alteração
                        </v-btn>
                      </div>
                    </div>
                  </v-expand-transition>
                </v-card-text>
              </v-card>

              <div class="form-actions mt-6">
                <v-btn variant="tonal" to="/" class="text-none px-8" size="large">Cancelar</v-btn>
                <v-btn color="primary" type="submit" class="text-none px-12" size="large" :loading="salvando">Salvar Tudo</v-btn>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-window-item>

      <v-window-item v-if="isSystemAdmin" value="admin">
        <v-card elevation="2" class="form-card mb-4">
          <v-card-title class="section-title">Administração de Módulos</v-card-title>
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
              <v-col cols="12" md="6">
                <v-select
                  v-model="produtoModulo"
                  :items="[
                    { title: 'Padrão', value: 'PADRAO' },
                    { title: 'Imobiliária', value: 'IMOBILIARIA' }
                  ]"
                  item-title="title"
                  item-value="value"
                  label="Tipo de CRM"
                  hint="Define se o CRM opera no modo padrão ou imobiliário"
                  persistent-hint
                />
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <v-row>
              <v-col cols="12" md="6">
                <v-switch v-model="enabledModulesForm.leads" label="Leads" color="primary" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="enabledModulesForm.negocios" label="Negócios" color="primary" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="enabledModulesForm.produtos" label="Produtos" color="primary" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="enabledModulesForm.imoveis" label="Empreendimentos" color="primary" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="enabledModulesForm.reservas" label="Reservas" color="primary" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="enabledModulesForm.contasPagar" label="Contas a Pagar" color="primary" hide-details />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch v-model="enabledModulesForm.contasReceber" label="Contas a Receber" color="primary" hide-details />
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-6">
              <v-btn
                color="primary"
                :loading="salvandoModulo"
                class="text-none"
                prepend-icon="mdi-content-save-check"
                @click="salvarModulo"
              >
                Salvar Alterações
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>

      <v-window-item v-if="isSystemAdmin" value="usuarios">
        <v-card elevation="2" class="form-card">
          <v-card-title class="section-title">Gestão de Usuários e Permissões</v-card-title>
          <v-card-text>
            <v-alert type="info" variant="tonal" class="mb-4">
              Aprove, ative/desative usuários e controle permissões de leitura, criação, edição e exclusão por módulo.
            </v-alert>

            <v-data-table :headers="userHeaders" :items="usersStore.users" :loading="usersStore.loading">
              <template #item.name="{ item }">
                <v-btn
                  variant="text"
                  color="primary"
                  class="user-link-btn"
                  @click="openUserProfile(item)"
                >
                  {{ item.name }}
                </v-btn>
              </template>

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
                  :disabled="item.isSystemAdmin"
                  @click="openPermissions(item)"
                >Permissões</v-btn>

                <v-btn
                  size="small"
                  variant="outlined"
                  color="primary"
                  class="mr-2"
                  @click="openUserProfile(item)"
                >Perfil</v-btn>

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
                  :disabled="item.isSystemAdmin"
                  @click="usersStore.revokeUser(item.id)"
                >Revogar</v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>

    <v-dialog v-model="permissionsDialog" max-width="980">
      <v-card class="permissions-card">
        <v-card-title class="permissions-title">
          <div>
            <h3>Permissões de {{ selectedUser?.name || selectedUser?.email }}</h3>
            <p>Controle acesso por módulo com edição rápida por linha.</p>
          </div>
          <v-chip color="primary" variant="tonal" size="small">
            {{ totalEnabledPermissions }} permissões ativas
          </v-chip>
        </v-card-title>

        <v-card-text>
          <v-table density="comfortable" class="permissions-table">
            <thead>
              <tr>
                <th>Módulo</th>
                <th class="text-center">Leitura</th>
                <th class="text-center">Criação</th>
                <th class="text-center">Edição</th>
                <th class="text-center">Exclusão</th>
                <th class="text-center">Tudo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="module in permissionModules" :key="module.key">
                <td>
                  <div class="module-cell">
                    <strong>{{ module.label }}</strong>
                    <small>{{ rowEnabledCount(module.key) }}/4</small>
                  </div>
                </td>
                <td class="text-center">
                  <v-checkbox-btn v-model="editablePermissions[module.key].read" color="primary" />
                </td>
                <td class="text-center">
                  <v-checkbox-btn v-model="editablePermissions[module.key].create" color="primary" />
                </td>
                <td class="text-center">
                  <v-checkbox-btn v-model="editablePermissions[module.key].update" color="primary" />
                </td>
                <td class="text-center">
                  <v-checkbox-btn v-model="editablePermissions[module.key].delete" color="primary" />
                </td>
                <td class="text-center">
                  <v-checkbox-btn
                    :model-value="isRowFullyEnabled(module.key)"
                    color="primary"
                    @update:model-value="toggleModuleAll(module.key, $event)"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-card-actions class="permissions-actions">
          <v-btn variant="text" @click="permissionsDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="savingPermissions" @click="savePermissions">
            Salvar permissões
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="userProfileDialog" max-width="700" persistent transition="dialog-bottom-transition">
      <v-card class="permissions-card modal-elegant">
        <v-card-title class="permissions-title px-6 pt-6">
          <div class="d-flex align-center w-100">
             <div class="modal-icon-container mr-4">
                <v-icon icon="mdi-account-circle-outline" color="primary" size="24" />
             </div>
             <div>
               <h3 class="text-h5 font-weight-bold mb-0">Dados do usuário</h3>
               <p class="text-body-2 text-grey-darken-1 mb-0">Visualize e atualize informações pessoais e senha.</p>
             </div>
             <v-spacer />
             <v-btn icon="mdi-close" variant="text" color="grey" @click="userProfileDialog = false" />
          </div>
        </v-card-title>

        <v-divider class="mt-4" />

        <v-card-text class="pa-6">
          <div class="section-group mb-6">
            <h4 class="text-overline font-weight-bold text-primary mb-4">Informações Pessoais</h4>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editableUserProfile.name"
                  label="Nome completo"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  density="comfortable"
                  prepend-inner-icon="mdi-account-outline"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editableUserProfile.email"
                  label="E-mail"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  density="comfortable"
                  prepend-inner-icon="mdi-email-outline"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editableUserProfile.phone"
                  label="Telefone"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  density="comfortable"
                  prepend-inner-icon="mdi-phone-outline"
                  placeholder="(00) 00000-0000"
                  @update:model-value="onUserPhoneInput"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="editableUserProfile.birthDate"
                  label="Data de nascimento"
                  type="date"
                  variant="outlined"
                  bg-color="grey-lighten-5"
                  density="comfortable"
                  prepend-inner-icon="mdi-calendar-outline"
                />
              </v-col>
            </v-row>
          </div>

        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn
            variant="tonal"
            color="grey-darken-1"
            class="text-none px-6"
            @click="userProfileDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="savingUserProfile"
            class="text-none px-6"
            @click="saveUserProfile"
          >
            Salvar dados
          </v-btn>
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
import { useAuthStore } from '../stores/authStore'
import { useBrandingStore } from '../stores/brandingStore'
import { useModulesStore } from '../stores/modulesStore'
import { useUsersStore } from '../stores/usersStore'
import { useClientesStore } from '../stores/clientesStore'
import { notificationsStore } from '../stores/notificationsStore'
import { maskCNPJ, maskPhone, maskCEP } from '../utils/formatters'
import { getApiBaseUrl } from '../utils/apiBase'
import { resolveTenantHint } from '../utils/tenantHint'
import { resizeImage } from '../utils/imageUtils'

const { branding, salvarBranding, carregarBrandingPublico, salvarBrandingRemoto } = useBrandingStore()
const authStore = useAuthStore()
const modulesStore = useModulesStore()
const usersStore = useUsersStore()
const clientesStore = useClientesStore()

const activeTab = ref('geral')
const logoInput = ref<HTMLInputElement | null>(null)
const ownerPhotoInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string>('')
const ownerPreviewUrl = ref<string>('')
const salvando = ref(false)
const editandoLogo = ref(false)
const isDraggingLogo = ref(false)
const produtoModulo = ref('PADRAO')
const enabledModulesForm = ref({
  leads: true,
  produtos: true,
  imoveis: true,
  reservas: true,
  negocios: true,
  contasPagar: true,
  contasReceber: true,
})
const erroModulo = ref('')
const salvandoModulo = ref(false)
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
const savingPermissions = ref(false)
const userProfileDialog = ref(false)
const savingUserProfile = ref(false)
const editableUserProfile = ref({
  id: '',
  name: '',
  email: '',
  phone: '',
  birthDate: '',
})
const passwordForm = ref({
  password: '',
  confirmPassword: '',
})

// Novos controles para mudança de senha pessoal
const showPasswordChange = ref(false)
const personalPasswordForm = ref({
  password: '',
  confirmPassword: '',
})

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

const permissionActions = ['read', 'create', 'update', 'delete'] as const

const userHeaders = [
  { title: 'Nome', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Status', key: 'status' },
  { title: 'Ações', key: 'actions', sortable: false },
]

const form = ref({
  nomeCRM: branding.value.nomeCRM,
  logoUrl: branding.value.logoUrl,
  ownerPhotoUrl: branding.value.ownerPhotoUrl,
  ownerName: branding.value.ownerName,
  ownerDescription: branding.value.ownerDescription,
  logoScale: branding.value.logoScale,
  logoOffsetX: branding.value.logoOffsetX,
  logoOffsetY: branding.value.logoOffsetY,
  slogan: branding.value.slogan,
  email: branding.value.email,
  telefone: branding.value.telefone,
  endereco: branding.value.endereco,
  cep: branding.value.cep,
  logradouro: branding.value.logradouro,
  numero: branding.value.numero,
  complemento: branding.value.complemento,
  cidade: branding.value.cidade,
  uf: branding.value.uf,
  website: branding.value.website,
  cnpj: branding.value.cnpj,
})

const syncFormFromBranding = () => {
  form.value = {
    nomeCRM: branding.value.nomeCRM,
    logoUrl: branding.value.logoUrl,
    ownerPhotoUrl: branding.value.ownerPhotoUrl,
    ownerName: branding.value.ownerName,
    ownerDescription: branding.value.ownerDescription,
    logoScale: branding.value.logoScale,
    logoOffsetX: branding.value.logoOffsetX,
    logoOffsetY: branding.value.logoOffsetY,
    slogan: branding.value.slogan,
    email: branding.value.email,
    telefone: branding.value.telefone,
    endereco: branding.value.endereco,
    cep: branding.value.cep || '',
    logradouro: branding.value.logradouro || '',
    numero: branding.value.numero || '',
    complemento: branding.value.complemento || '',
    cidade: branding.value.cidade || '',
    uf: branding.value.uf || '',
    website: branding.value.website,
    cnpj: branding.value.cnpj,
  }
}

const getConfigHeaders = () => ({
  'Content-Type': 'application/json',
  ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
  ...((authStore.user?.tenantId || resolveTenantHint())
    ? { 'x-tenant-id': (authStore.user?.tenantId || resolveTenantHint()) as string }
    : {}),
})

const fetchLoginPhraseConfig = async () => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/configuracoes/login_phrase`, {
      headers: getConfigHeaders(),
      cache: 'no-store',
    })
    if (!response.ok) return
    const data = await response.json().catch(() => ({}))
    form.value.slogan = String(data?.valor || '')
  } catch (error) {
    console.warn('Could not fetch login phrase from backend:', error)
  }
}

const persistLoginPhraseConfig = async () => {
  const response = await fetch(`${getApiBaseUrl()}/configuracoes/login_phrase`, {
    method: 'POST',
    headers: getConfigHeaders(),
    body: JSON.stringify({ valor: form.value.slogan || '' }),
  })
  if (!response.ok) {
    throw new Error('Não foi possível salvar a frase da tela de login.')
  }
}

onMounted(async () => {
  await carregarBrandingPublico()
  syncFormFromBranding()
  await modulesStore.fetchConfig()
  await fetchLoginPhraseConfig()
  produtoModulo.value = modulesStore.produtoModulo === 'IMOBILIARIA' ? 'IMOBILIARIA' : 'PADRAO'
  enabledModulesForm.value = { ...modulesStore.enabledModules }
  if (isSystemAdmin.value) {
    await usersStore.fetchUsers()
  }
  
  // Garantir que carregue com máscara se já houver dados
  if (form.value.cnpj) form.value.cnpj = maskCNPJ(form.value.cnpj)
  if (form.value.telefone) form.value.telefone = maskPhone(form.value.telefone)
  if (form.value.cep) form.value.cep = maskCEP(form.value.cep)
  
  await carregarEstados()
})

const estados = ref<{ nome: string; sigla: string }[]>([])
const buscandoCep = ref(false)

const carregarEstados = async () => {
  const reps = await clientesStore.carregarEstados()
  estados.value = reps || []
}

const onCepInput = (val: string) => {
  form.value.cep = maskCEP(val || '')
  if (form.value.cep.length === 9) {
    buscarCep()
  }
}

const buscarCep = async () => {
  if (form.value.cep.length < 9) return
  buscandoCep.value = true
  try {
    const res = await clientesStore.buscarCEP(form.value.cep)
    if (res) {
      form.value.logradouro = res.logradouro || ''
      form.value.cidade = res.cidade || ''
      form.value.uf = res.estado || ''
    }
  } catch (e) {
    console.error(e)
  } finally {
    buscandoCep.value = false
  }
}

const logoPreviewStyle = computed(() => ({
  transform: `translate(${form.value.logoOffsetX || 0}px, ${form.value.logoOffsetY || 0}px) scale(${form.value.logoScale / 100})`,
}))

const totalEnabledPermissions = computed(() => {
  return permissionModules.reduce((sum, module) => sum + rowEnabledCount(module.key), 0)
})

const isSystemAdmin = computed(() => {
  return !!authStore.user?.isSystemAdmin
})

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

const concluirEdicaoLogo = () => {
  editandoLogo.value = false
}

const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const originalBase64 = e.target?.result as string
      try {
        // Redimensionar logo para no máximo 800x800 com boa qualidade
        const compressed = await resizeImage(originalBase64, 800, 800, 0.9)
        previewUrl.value = compressed
        form.value.logoUrl = compressed
        form.value.logoOffsetX = 0
        form.value.logoOffsetY = 0
        editandoLogo.value = true
      } catch (err) {
        console.error('Erro ao processar logo:', err)
        notificationsStore.notify('Erro ao processar a imagem. Tente outra.', 'error')
      }
    }
    reader.readAsDataURL(file)
  } else {
    previewUrl.value = ''
  }
}

const handleOwnerPhotoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    const originalBase64 = e.target?.result as string
    try {
      // Redimensionar foto de capa para no máximo 1200x800 com compressão
      const compressed = await resizeImage(originalBase64, 1200, 1200, 0.7)
      ownerPreviewUrl.value = compressed
      form.value.ownerPhotoUrl = compressed
    } catch (err) {
      console.error('Erro ao processar foto:', err)
      notificationsStore.notify('Erro ao processar a foto. Tente outra.', 'error')
    }
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
  if (user?.isSystemAdmin) return
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

const openUserProfile = (user: any) => {
  editableUserProfile.value = {
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    birthDate: user.birthDate || '',
  }
  passwordForm.value = {
    password: '',
    confirmPassword: '',
  }
  userProfileDialog.value = true
}

const savePermissions = async () => {
  if (!selectedUser.value) return
  savingPermissions.value = true
  try {
    await usersStore.savePermissions(selectedUser.value.id, editablePermissions.value)
    permissionsDialog.value = false
    notificationsStore.notify('Permissões salvas com sucesso.', 'success')
  } catch (error: any) {
    notificationsStore.notify(error?.message || 'Não foi possível salvar permissões.', 'error')
  } finally {
    savingPermissions.value = false
  }
}


const onUserPhoneInput = (value: string) => {
  editableUserProfile.value.phone = maskPhone(value || '')
}

const saveUserProfile = async () => {
  if (!editableUserProfile.value.id) return
  savingUserProfile.value = true
  try {
    await usersStore.updateProfile(editableUserProfile.value.id, {
      name: editableUserProfile.value.name,
      email: editableUserProfile.value.email,
      phone: editableUserProfile.value.phone,
      birthDate: editableUserProfile.value.birthDate,
    })

    notificationsStore.notify('Dados do usuário atualizados com sucesso.', 'success')
    userProfileDialog.value = false
  } catch (error: any) {
    notificationsStore.notify(error?.message || 'Não foi possível salvar os dados do usuário.', 'error')
  } finally {
    savingUserProfile.value = false
  }
}

const rowEnabledCount = (moduleKey: string) => {
  const row = editablePermissions.value[moduleKey] || {}
  return permissionActions.reduce((acc, action) => acc + (row[action] ? 1 : 0), 0)
}

const isRowFullyEnabled = (moduleKey: string) => {
  const row = editablePermissions.value[moduleKey] || {}
  return permissionActions.every((action) => !!row[action])
}

const toggleModuleAll = (moduleKey: string, enabled: boolean) => {
  if (!editablePermissions.value[moduleKey]) {
    editablePermissions.value[moduleKey] = {
      read: false,
      create: false,
      update: false,
      delete: false,
    }
  }
  permissionActions.forEach((action) => {
    editablePermissions.value[moduleKey][action] = enabled
  })
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
    // 1. Salvar branding
    // Construct address summary for compatibility
    const parts = []
    if (form.value.logradouro) parts.push(form.value.logradouro)
    if (form.value.numero) parts.push(form.value.numero)
    if (form.value.complemento) parts.push(form.value.complemento)
    let summary = parts.join(', ')
    if (form.value.cidade || form.value.uf) {
      summary += (summary ? ' - ' : '') + `${form.value.cidade}/${form.value.uf}`
    }
    if (form.value.cep) summary += (summary ? ' ' : '') + `(CEP: ${form.value.cep})`
    form.value.endereco = summary

    salvarBranding(form.value)
    await salvarBrandingRemoto(authStore.token || '', authStore.user?.tenantId)
    
    // 2. Persistir frase de login
    await persistLoginPhraseConfig()

    // 3. Salvar senha se preenchida
    if (personalPasswordForm.value.password) {
      if (personalPasswordForm.value.password !== personalPasswordForm.value.confirmPassword) {
        throw new Error('As senhas de segurança não coincidem.')
      }
      if (personalPasswordForm.value.password.length < 6) {
        throw new Error('A nova senha deve ter pelo menos 6 caracteres.')
      }
      if (!authStore.user?.id) throw new Error('Usuário não identificado.')
      
      await usersStore.changePassword(authStore.user.id, personalPasswordForm.value.password)
    }

    // 4. Salvar configurações de admin se aplicável
    if (isSystemAdmin.value) {
      await modulesStore.setProdutoModulo(produtoModulo.value)
      await modulesStore.setEnabledModules(enabledModulesForm.value)
      const confirmed = await modulesStore.fetchConfig()
      if (confirmed !== produtoModulo.value) {
        throw new Error('O tipo de CRM não foi persistido corretamente.')
      }
    }

    localStorage.setItem('crm.showSavedSnackbar', 'true')
    window.location.href = '/'
  } catch (error: any) {
    console.error(error)
    erroModulo.value = error.message || 'Não foi possível salvar as configurações. Tente novamente.'
    notificationsStore.notify(erroModulo.value, 'error')
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

const salvarModulo = async () => {
  salvandoModulo.value = true
  erroModulo.value = ''
  try {
    await modulesStore.setProdutoModulo(produtoModulo.value)
    await modulesStore.setEnabledModules(enabledModulesForm.value)
    await modulesStore.fetchConfig()

    notificationsStore.notify('Configurações de módulos salvas com sucesso.', 'success')
    
    // Opcional: Recarregar para aplicar mudanças estruturais se necessário
    // window.location.reload()
  } catch (error: any) {
    console.error(error)
    erroModulo.value = error.message || 'Não foi possível salvar os módulos.'
    notificationsStore.notify(erroModulo.value, 'error')
  } finally {
    salvandoModulo.value = false
  }
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
  object-fit: contain; /* Harmony with background color */
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

.permissions-card {
  border-radius: 16px;
}

.permissions-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
}

.permissions-title h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #102542;
}

.permissions-title p {
  margin: 0.25rem 0 0;
  color: #64748b;
  font-size: 0.86rem;
}

.modal-elegant {
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

.modal-icon-container {
  background: rgba(59, 130, 246, 0.1);
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-group {
  position: relative;
}

.permissions-table :deep(th) {
  font-weight: 700;
  color: #334155;
}

.permissions-table :deep(tbody tr:hover) {
  background: #f8fbff;
}

.module-cell {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.module-cell strong {
  color: #0f172a;
}

.module-cell small {
  color: #64748b;
  font-size: 0.76rem;
}

.permissions-actions {
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.8rem 1rem 1rem;
}

.user-link-btn {
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
  justify-content: flex-start;
  padding-inline: 0;
  min-width: auto;
}

.btn-recenter {
  font-size: 0.875rem !important;
  color: rgba(0, 0, 0, 0.6) !important;
  font-weight: 400 !important;
}
</style>
