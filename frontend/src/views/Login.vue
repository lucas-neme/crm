<template>
  <v-container fluid class="login-screen pa-0">
    <div class="bg-orb bg-orb-a"></div>
    <div class="bg-orb bg-orb-b"></div>

    <template v-if="mobile">
      <div class="mobile-shell">
        <v-sheet class="mobile-card" elevation="0">
          <div class="mobile-brand">
            <div class="mobile-logo-wrap">
              <img :src="logoSrc" alt="Logo CRM" class="mobile-logo" />
            </div>
            <h1 class="mobile-title">{{ crmName }}</h1>
            <p class="mobile-subtitle">Soluções imobiliárias com experiência e confiança</p>
          </div>

          <v-sheet class="mobile-form-card" elevation="0">
            <v-alert v-if="statusMessage" :type="statusType" variant="tonal" class="mb-4">
              {{ statusMessage }}
            </v-alert>

            <v-form v-if="mode === 'login'" @submit.prevent="handleLogin" class="auth-form">
              <h2 class="mobile-form-title">Acesse sua conta</h2>
              <v-text-field
                v-model="loginEmail"
                label="Usuário ou e-mail"
                type="text"
                prepend-inner-icon="mdi-email-outline"
                variant="solo"
                flat
                hide-details
                required
              />
              <v-text-field
                v-model="loginPassword"
                label="Senha"
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
              <img :src="logoSrc" alt="Logo CRM" class="brand-logo" />
            </div>
            <div>
              <p class="brand-kicker">Plataforma inteligente</p>
              <h1 class="brand-title">{{ crmName }}</h1>
              <p class="brand-subtitle">Gestão comercial, relacionamento e operação em um único fluxo.</p>
            </div>
          </div>

          <v-card class="owner-card" elevation="0">
            <v-img :src="ownerPhotoSrc" cover class="owner-photo">
              <template #error>
                <div class="owner-fallback">
                  <span class="owner-fallback-tag">Foto do proprietário</span>
                  <strong>CRM</strong>
                </div>
              </template>
            </v-img>
            <div class="owner-content">
              <p class="owner-label">Direção</p>
              <h2 class="owner-name">{{ ownerName }}</h2>
              <p class="owner-text">
                Experiência de verdade, compromisso com cada cliente e postura firme em cada negociação.
                No mercado imobiliário, segurança e resultado vêm com conhecimento e responsabilidade.
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
            <v-text-field v-model="loginEmail" label="Usuário ou e-mail" type="text" prepend-inner-icon="mdi-email-outline" required />
            <v-text-field
              v-model="loginPassword"
              label="Senha"
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
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/authStore'
import { useBrandingStore } from '@/stores/brandingStore'

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

const crmName = computed(() => brandingStore.branding.value.nomeCRM || 'CRM')
const logoSrc = computed(() => {
  const configured = (brandingStore.branding.value.logoUrl || '').trim()
  if (configured && !configured.includes('one-cup-logo')) return configured
  return '/assets/images/logos/logo-owner.png'
})
const ownerPhotoSrc = computed(() => brandingStore.branding.value.ownerPhotoUrl || '/assets/images/owners/owner-main.png')
const ownerName = computed(() => brandingStore.branding.value.ownerName || 'Proprietário do CRM')

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
    pushStatus(error?.message || 'Erro ao realizar login.', 'error')
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
    pushStatus(error?.message || 'Erro ao registrar usuário.', 'error')
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
    pushStatus(error?.message || 'Erro ao solicitar recuperação de senha.', 'error')
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
    pushStatus(error?.message || 'Erro ao redefinir senha.', 'error')
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
  background: radial-gradient(1000px 700px at 10% 10%, #d8deec 0%, #eff2f8 40%, #f4f6fb 100%);
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
  background: #285ea8;
}

.bg-orb-b {
  width: 360px;
  height: 360px;
  bottom: -110px;
  right: -80px;
  background: #7aa8e8;
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
  background: linear-gradient(180deg, #f8f8fc 0%, #f2f4fb 100%);
  border: 1px solid #e1e5f2;
  box-shadow: 0 30px 70px rgba(40, 62, 96, 0.18);
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
  background: #f3f0ec;
  border: 1px solid #ebe5df;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-logo {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.mobile-title {
  margin: 0;
  font-size: clamp(2rem, 8vw, 2.6rem);
  color: #203e6a;
  font-weight: 800;
  line-height: 1.05;
}

.mobile-subtitle {
  margin: 0.65rem auto 0;
  max-width: 280px;
  color: #4a596f;
  font-size: 1.09rem;
  line-height: 1.35;
}

.mobile-form-card {
  border-radius: 22px;
  background: #fcfcff;
  border: 1px solid #e4e8f2;
  padding: 20px 16px 18px;
}

.mobile-form-title {
  margin: 0 0 14px;
  color: #1f3f6c;
  font-weight: 800;
  font-size: 1.95rem;
  line-height: 1.1;
}

.forgot-link {
  align-self: center;
  color: #28589d;
  font-size: 1.03rem;
  text-transform: none;
  letter-spacing: 0;
}

.mobile-submit-btn {
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(35, 93, 169, 0.28);
}

.create-label {
  margin: 0;
  text-align: center;
  color: #4f5d72;
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
  background: #ffffff;
  box-shadow: 0 18px 40px rgba(20, 45, 92, 0.18);
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
  color: #2f5f9f;
  font-weight: 700;
}

.brand-title {
  margin: 4px 0;
  font-size: clamp(34px, 4vw, 52px);
  line-height: 1;
  color: #163965;
  font-weight: 800;
}

.brand-subtitle {
  margin: 0;
  color: #35537a;
  max-width: 520px;
}

.owner-card {
  display: grid;
  grid-template-columns: 170px 1fr;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(38, 78, 130, 0.1);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(17, 40, 79, 0.15);
}

.owner-photo {
  min-height: 220px;
  background: linear-gradient(160deg, #133664 0%, #2c65aa 100%);
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
  background: linear-gradient(140deg, #163965, #2e63a8);
  color: #fff;
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
  color: #2e63a8;
  font-weight: 700;
}

.owner-name {
  margin: 8px 0 10px;
  font-size: 24px;
  color: #1a3558;
}

.owner-text {
  margin: 0;
  color: #4b6487;
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
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(41, 84, 136, 0.12);
  box-shadow: 0 24px 55px rgba(23, 48, 91, 0.16);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-title {
  margin: 0 0 6px;
  font-size: 24px;
  color: #193a66;
}

.helper-text {
  margin: 0;
  color: #53709a;
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
  font-family: 'Inter', sans-serif;
}

.powered-by-text {
  font-size: 14px;
  font-weight: 700;
  color: #0f4c81; /* Blue color from image */
  letter-spacing: -0.02em;
}

.powered-by-icon-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: white;
  object-fit: contain;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.powered-by-mobile {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

</style>
