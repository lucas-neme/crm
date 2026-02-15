<template>
  <v-container fluid class="login-screen pa-0">
    <div class="bg-orb bg-orb-a"></div>
    <div class="bg-orb bg-orb-b"></div>

    <template v-if="mobile">
      <div class="mobile-shell">
        <v-sheet class="mobile-card" elevation="0">
          <div class="mobile-brand">
            <div class="mobile-logo-wrap">
              <img v-if="logoSrc" :src="logoSrc" alt="Logo CRM" class="mobile-logo" />
              <v-icon v-else icon="mdi-shield-crown-outline" color="rgba(0,0,0,0.4)" size="48" />
            </div>
            <h1 class="mobile-title">{{ crmName }}</h1>
            <p v-if="slogan" class="mobile-subtitle">{{ slogan }}</p>
          </div>

          <v-sheet class="mobile-form-card" elevation="0">
            <v-alert v-if="statusMessage" :type="statusType" variant="tonal" class="mb-4">
              {{ statusMessage }}
            </v-alert>

            <v-form v-if="mode === 'login'" @submit.prevent="handleLogin" class="auth-form">
              <h2 class="mobile-form-title">Acesse sua conta</h2>
              <v-text-field
                v-model="loginEmail"
                placeholder="Usuário ou e-mail"
                persistent-placeholder
                type="text"
                prepend-inner-icon="mdi-email-outline"
                variant="solo"
                flat
                hide-details
                required
              />
              <v-text-field
                v-model="loginPassword"
                placeholder="Senha"
                persistent-placeholder
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                variant="solo"
                flat
                hide-details
                @click:append-inner="showPassword = !showPassword"
                required
              />

              <v-btn variant="text" class="forgot-link" @click="setMode('forgot')">Esqueceu a senha?</v-btn>

              <v-btn type="submit" color="primary" size="x-large" block :loading="loading" class="mobile-submit-btn">
                Entrar
              </v-btn>

              <v-divider class="my-6" />

              <p class="create-label">Ainda não tem conta?</p>
              <v-btn variant="outlined" color="primary" block class="create-btn" @click="setMode('register')">
                Criar conta
              </v-btn>
            </v-form>

            <v-form v-else-if="mode === 'register'" @submit.prevent="handleRegister" class="auth-form">
              <h2 class="mobile-form-title">Crie sua conta</h2>
              <v-text-field v-model="registerName" label="Nome" prepend-inner-icon="mdi-account-outline" required />
              <v-text-field v-model="registerEmail" label="E-mail" type="email" prepend-inner-icon="mdi-email-outline" required />
              <v-text-field
                v-model="registerPassword"
                label="Senha"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                required
              />
              <v-btn type="submit" color="primary" size="large" block :loading="loading">Solicitar cadastro</v-btn>
              <p class="helper-text">A conta só libera acesso após aprovação do administrador em Usuários.</p>
              <v-btn variant="text" block @click="setMode('login')">Voltar para login</v-btn>
            </v-form>

            <v-form v-else-if="mode === 'forgot'" @submit.prevent="handleForgotPassword" class="auth-form">
              <h2 class="mobile-form-title">Recuperar senha</h2>
              <v-text-field v-model="forgotEmail" label="E-mail" type="email" prepend-inner-icon="mdi-email-outline" required />
              <v-btn type="submit" color="primary" size="large" block :loading="loading">Enviar link de recuperação</v-btn>
              <p class="helper-text">Você receberá um e-mail com o link para redefinir sua senha.</p>
              <v-btn variant="text" block @click="setMode('login')">Voltar para login</v-btn>
            </v-form>

            <v-form v-else @submit.prevent="handleResetPassword" class="auth-form">
              <h2 class="mobile-form-title">Redefinir senha</h2>
              <v-text-field v-model="resetToken" label="Token" prepend-inner-icon="mdi-key-outline" required />
              <v-text-field
                v-model="resetPassword"
                label="Nova senha"
                :type="showPassword ? 'text' : 'password'"
                prepend-inner-icon="mdi-lock-reset"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                required
              />
              <v-btn type="submit" color="primary" size="large" block :loading="loading">Redefinir senha</v-btn>
              <v-btn variant="text" block @click="setMode('login')">Voltar para login</v-btn>
            </v-form>
          </v-sheet>
        </v-sheet>
        
        <div class="powered-by-mobile">
          <span class="powered-by-text">Powered by One Cup Tech Solutions</span>
          <img src="/one-cup-logo.png" alt="One Cup Tech Solutions" class="powered-by-icon-img" />
        </div>
      </div>
    </template>

    <v-row v-else no-gutters class="login-grid">
      <v-col cols="12" md="6" class="brand-panel">
        <div class="brand-block">
          <div class="brand-head">
            <div class="brand-logo-wrap">
              <img v-if="logoSrc" :src="logoSrc" alt="Logo CRM" class="brand-logo" />
              <v-icon v-else icon="mdi-shield-crown-outline" color="rgba(0,0,0,0.4)" size="46" />
            </div>
            <div>
              <p class="brand-kicker">Plataforma inteligente</p>
              <h1 class="brand-title">{{ crmName }}</h1>
              <p v-if="slogan" class="brand-subtitle">{{ slogan }}</p>
            </div>
          </div>

          <v-card class="owner-card" elevation="0">
            <v-img :src="ownerPhotoSrc" cover class="owner-photo">
              <template #error>
                <div class="owner-fallback">
                  <span class="owner-fallback-tag">Foto do proprietário</span>
                  <v-icon icon="mdi-account-tie-outline" size="64" color="rgba(255,255,255,0.7)" class="mb-2" />
                  <strong>CRM</strong>
                </div>
              </template>
            </v-img>
            <div class="owner-content">
              <p class="owner-label">Direção</p>
              <h2 class="owner-name">{{ ownerName }}</h2>
              <p v-if="ownerDescription" class="owner-text">
                {{ ownerDescription }}
              </p>
            </div>
          </v-card>
        </div>
      </v-col>

      <v-col cols="12" md="6" class="form-panel">
        <v-sheet class="auth-shell" elevation="0">
          <v-alert v-if="statusMessage" :type="statusType" variant="tonal" class="mb-4">
            {{ statusMessage }}
          </v-alert>

          <v-form v-if="mode === 'login'" @submit.prevent="handleLogin" class="auth-form">
            <h3 class="form-title">Acesse sua conta</h3>
            <v-text-field
              v-model="loginEmail"
              placeholder="Usuário ou e-mail"
              persistent-placeholder
              type="text"
              prepend-inner-icon="mdi-email-outline"
              required
            />
            <v-text-field
              v-model="loginPassword"
              placeholder="Senha"
              persistent-placeholder
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              required
            />
            <v-btn variant="text" class="forgot-link" @click="setMode('forgot')">Esqueceu a senha?</v-btn>
            <v-btn type="submit" color="primary" size="large" block :loading="loading">Entrar</v-btn>
            <v-divider class="my-4" />
            <p class="create-label">Ainda não tem conta?</p>
            <v-btn variant="outlined" color="primary" block class="create-btn" @click="setMode('register')">
              Criar conta
            </v-btn>
          </v-form>

          <v-form v-else-if="mode === 'register'" @submit.prevent="handleRegister" class="auth-form">
            <h3 class="form-title">Crie seu acesso</h3>
            <v-text-field v-model="registerName" label="Nome" prepend-inner-icon="mdi-account-outline" required />
            <v-text-field v-model="registerEmail" label="E-mail" type="email" prepend-inner-icon="mdi-email-outline" required />
            <v-text-field
              v-model="registerPassword"
              label="Senha"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              required
            />
            <v-btn type="submit" color="primary" size="large" block :loading="loading">Solicitar cadastro</v-btn>
            <p class="helper-text">A conta só libera acesso após aprovação do administrador em Usuários.</p>
          </v-form>

          <v-form v-else-if="mode === 'forgot'" @submit.prevent="handleForgotPassword" class="auth-form">
            <h3 class="form-title">Recuperar senha</h3>
            <v-text-field v-model="forgotEmail" label="E-mail" type="email" prepend-inner-icon="mdi-email-outline" required />
            <v-btn type="submit" color="primary" size="large" block :loading="loading">Enviar link de recuperação</v-btn>
            <p class="helper-text">Você receberá um e-mail com o link para redefinir sua senha.</p>
          </v-form>

          <v-form v-else @submit.prevent="handleResetPassword" class="auth-form">
            <h3 class="form-title">Redefinir senha</h3>
            <v-text-field v-model="resetToken" label="Token" prepend-inner-icon="mdi-key-outline" required />
            <v-text-field
              v-model="resetPassword"
              label="Nova senha"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-reset"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              required
            />
            <v-btn type="submit" color="primary" size="large" block :loading="loading">Redefinir senha</v-btn>
            <v-btn variant="text" block @click="setMode('login')">Voltar para login</v-btn>
          </v-form>
        </v-sheet>
      </v-col>
    </v-row>
    
    <div v-if="!mobile" class="powered-by-desktop">
      <span class="powered-by-text">Powered by One Cup Tech Solutions</span>
      <img src="/one-cup-logo.png" alt="One Cup Tech Solutions" class="powered-by-icon-img" />
    </div>

  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/authStore'
import { useBrandingStore } from '@/stores/brandingStore'
import { getApiBaseUrl } from '@/utils/apiBase'
import { resolveTenantHint } from '@/utils/tenantHint'

type AuthMode = 'login' | 'register' | 'forgot' | 'reset'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const brandingStore = useBrandingStore()
const { mobile } = useDisplay()

const mode = ref<AuthMode>('login')
const loading = ref(false)
const showPassword = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error' | 'info' | 'warning'>('info')

const loginEmail = ref('')
const loginPassword = ref('')

const registerName = ref('')
const registerEmail = ref('')
const registerPassword = ref('')

const forgotEmail = ref('')

const resetToken = ref('')
const resetPassword = ref('')
const loginPhrase = ref('')

const crmName = computed(() => brandingStore.branding.value.nomeCRM)
const logoSrc = computed(() => brandingStore.branding.value.logoUrl)
const ownerPhotoSrc = computed(() => brandingStore.branding.value.ownerPhotoUrl)
const ownerName = computed(() => brandingStore.branding.value.ownerName)
const slogan = computed(() => loginPhrase.value || brandingStore.branding.value.slogan)
const ownerDescription = computed(() => brandingStore.branding.value.ownerDescription)

onMounted(async () => {
  try {
    await brandingStore.carregarBrandingPublico()
    const tenantId = resolveTenantHint()
    const response = await fetch(`${getApiBaseUrl()}/configuracoes/public/login_phrase`, {
      headers: {
        ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
      },
      cache: 'no-store',
    })
    if (!response.ok) return
    const data = await response.json().catch(() => ({}))
    loginPhrase.value = String(data?.valor || '').trim()
  } catch {
    loginPhrase.value = ''
  }
})

function pushStatus(message: string, type: 'success' | 'error' | 'info' | 'warning') {
  statusMessage.value = message
  statusType.value = type
}

function syncModeFromQuery() {
  const queryMode = String(route.query.mode || '').toLowerCase()
  if (queryMode === 'register' || queryMode === 'forgot' || queryMode === 'reset' || queryMode === 'login') {
    mode.value = queryMode as AuthMode
  }

  if (route.query.token) {
    resetToken.value = String(route.query.token)
    mode.value = 'reset'
  }
}

function setMode(nextMode: AuthMode) {
  mode.value = nextMode
  const query: Record<string, string> = { ...route.query } as Record<string, string>
  if (nextMode === 'login') {
    delete query.mode
    delete query.token
  } else {
    query.mode = nextMode
  }
  router.replace({ query })
}

watch(() => route.query, syncModeFromQuery, { immediate: true })

async function handleLogin() {
  loading.value = true
  pushStatus('', 'info')
  try {
    const success = await authStore.login(loginEmail.value, loginPassword.value)
    if (success) {
      router.push('/')
      return
    }
    pushStatus('Credenciais inválidas.', 'error')
  } catch (error: any) {
    let msg = error?.message || 'Erro ao realizar login.'
    if (msg === 'Failed to fetch') {
      msg = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    }
    pushStatus(msg, 'error')
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  loading.value = true
  pushStatus('', 'info')
  try {
    const message = await authStore.register(registerName.value, registerEmail.value, registerPassword.value)
    pushStatus(message, 'success')
    setMode('login')
  } catch (error: any) {
    let msg = error?.message || 'Erro ao registrar usuário.'
    if (msg === 'Failed to fetch') {
      msg = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    }
    pushStatus(msg, 'error')
  } finally {
    loading.value = false
  }
}

async function handleForgotPassword() {
  loading.value = true
  pushStatus('', 'info')
  try {
    const message = await authStore.forgotPassword(forgotEmail.value)
    pushStatus(message, 'success')
  } catch (error: any) {
    let msg = error?.message || 'Erro ao solicitar recuperação de senha.'
    if (msg === 'Failed to fetch') {
      msg = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    }
    pushStatus(msg, 'error')
  } finally {
    loading.value = false
  }
}

async function handleResetPassword() {
  loading.value = true
  pushStatus('', 'info')
  try {
    const message = await authStore.resetPassword(resetToken.value, resetPassword.value)
    pushStatus(message, 'success')
    setMode('login')
  } catch (error: any) {
    let msg = error?.message || 'Erro ao redefinir senha.'
    if (msg === 'Failed to fetch') {
      msg = 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    }
    pushStatus(msg, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-screen {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(1200px 620px at 80% 6%, rgba(215, 177, 111, 0.16), transparent 60%),
    radial-gradient(900px 600px at 0% 90%, rgba(68, 76, 99, 0.35), transparent 58%),
    linear-gradient(180deg, #0a0b10 0%, #10131c 100%);
}

.bg-orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(60px);
  opacity: 0.5;
  pointer-events: none;
}

.bg-orb-a {
  width: 420px;
  height: 420px;
  top: -130px;
  left: -90px;
  background: rgba(215, 177, 111, 0.35);
}

.bg-orb-b {
  width: 360px;
  height: 360px;
  bottom: -110px;
  right: -80px;
  background: rgba(75, 88, 124, 0.45);
}

.mobile-shell {
  min-height: 100vh;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 12px;
}

.mobile-card {
  width: 100%;
  max-width: 420px;
  border-radius: 34px;
  background: linear-gradient(180deg, #151925 0%, #10131d 100%);
  border: 1px solid rgba(215, 177, 111, 0.24);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
  padding: 26px 16px 18px;
}

.mobile-brand {
  text-align: center;
  padding: 6px 8px 18px;
}

.mobile-logo-wrap {
  width: 92px;
  height: 92px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: radial-gradient(circle at 45% 35%, #f8e7c8 0%, #d2a764 100%);
  border: 1px solid rgba(215, 177, 111, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-logo {
  width: 100%;
  height: 100%;
  padding: 10px;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.mobile-title {
  margin: 0;
  font-size: clamp(2rem, 8vw, 2.6rem);
  color: #f3e8d3;
  font-weight: 800;
  line-height: 1.05;
  font-family: 'Cinzel', serif;
  letter-spacing: 0.05em;
}

.mobile-subtitle {
  margin: 0.65rem auto 0;
  max-width: 280px;
  color: #c3b8a5;
  font-size: 1.09rem;
  line-height: 1.35;
}

.mobile-form-card {
  border-radius: 22px;
  background: rgba(18, 22, 32, 0.9);
  border: 1px solid rgba(215, 177, 111, 0.22);
  padding: 20px 16px 18px;
}

.mobile-form-title {
  margin: 0 0 14px;
  color: #f2e6d0;
  font-weight: 800;
  font-size: 1.95rem;
  line-height: 1.1;
  font-family: 'Cinzel', serif;
}

.forgot-link {
  align-self: center;
  color: #d7b16f;
  font-size: 1.03rem;
  text-transform: none;
  letter-spacing: 0;
}

.mobile-submit-btn {
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(191, 143, 80, 0.35);
}

.create-label {
  margin: 0;
  text-align: center;
  color: #bdb19b;
  font-size: 1.02rem;
}

.create-btn {
  margin-top: 0.9rem;
  border-radius: 12px;
  text-transform: none;
  font-size: 1.06rem;
}

.login-grid {
  min-height: 100vh;
  position: relative;
  z-index: 2;
}

.brand-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.brand-block {
  width: min(560px, 100%);
}

.brand-head {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.brand-logo-wrap {
  width: 86px;
  height: 86px;
  border-radius: 20px;
  background: radial-gradient(circle at 45% 35%, #f8e7c8 0%, #d2a764 100%);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.brand-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #d2bc93;
  font-weight: 700;
}

.brand-title {
  margin: 4px 0;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1;
  color: #f2e7d3;
  font-weight: 800;
  font-family: 'Cinzel', serif;
  letter-spacing: 0.05em;
}

.brand-subtitle {
  margin: 0;
  color: #c2b59b;
  max-width: 520px;
}

.owner-card {
  display: grid;
  grid-template-columns: 170px 1fr;
  background: rgba(20, 23, 33, 0.95);
  border: 1px solid rgba(215, 177, 111, 0.22);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
}

.owner-photo {
  min-height: 220px;
  background: linear-gradient(160deg, #1f2432 0%, #121722 100%);
}

.owner-fallback {
  width: 100%;
  height: 100%;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  text-align: center;
  background: linear-gradient(140deg, #1d2330, #131826);
  color: #f0e4d0;
}

.owner-fallback-tag {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.85;
}

.owner-fallback strong {
  font-size: 36px;
  font-weight: 800;
}

.owner-fallback::after {
  content: '';
  width: 70px;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
}

.owner-fallback :deep(*) {
  color: #fff;
}

.owner-content {
  padding: 20px 22px;
}

.owner-label {
  margin: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #d7b16f;
  font-weight: 700;
}

.owner-name {
  margin: 8px 0 10px;
  font-size: 24px;
  color: #f2e5ce;
}

.owner-text {
  margin: 0;
  color: #bfb39d;
  line-height: 1.5;
}

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.auth-shell {
  width: min(520px, 100%);
  border-radius: 22px;
  padding: 22px;
  background: rgba(17, 21, 31, 0.94);
  border: 1px solid rgba(215, 177, 111, 0.22);
  box-shadow: 0 24px 55px rgba(0, 0, 0, 0.5);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-title {
  margin: 0 0 6px;
  font-size: 24px;
  color: #f2e6cf;
  font-family: 'Cinzel', serif;
}

.helper-text {
  margin: 0;
  color: #bcaf97;
  font-size: 13px;
}

.powered-by-desktop {
  position: absolute;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

.powered-by-text {
  font-size: 14px;
  font-weight: 700;
  color: #d2bc93;
  letter-spacing: -0.02em;
}

.powered-by-icon-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(circle at 45% 35%, #f8e7c8 0%, #d2a764 100%);
  object-fit: contain;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.powered-by-mobile {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.auth-form :deep(.v-field) {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
}

.auth-form :deep(.v-field__input),
.auth-form :deep(.v-label) {
  color: #f0e7d8 !important;
}

/* Fix for browser autocomplete/autofill overlapping and background */
.auth-form :deep(input:-webkit-autofill),
.auth-form :deep(input:-webkit-autofill:hover),
.auth-form :deep(input:-webkit-autofill:focus),
.auth-form :deep(input:-webkit-autofill:active) {
  -webkit-text-fill-color: #f0e7d8 !important;
  transition: background-color 5000s ease-in-out 0s;
  box-shadow: inset 0 0 20px 20px rgba(0,0,0,0) !important;
}

.auth-form :deep(.v-field--focused .v-label),
.auth-form :deep(.v-field--dirty .v-label) {
  opacity: 0 !important; /* Hide label if dirty/focused when using placeholders */
}

@media (max-width: 960px) {
  .brand-panel {
    padding: 20px 14px 8px;
  }

  .form-panel {
    padding: 8px 14px 20px;
  }

  .auth-shell {
    width: 100%;
  }
}
</style>

