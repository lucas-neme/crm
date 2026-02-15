<template>
  <v-layout class="layout">
    <v-navigation-drawer
      v-model="drawer"
      :permanent="!mobile"
      :temporary="mobile"
      :width="mobile ? 296 : 232"
      class="sidebar"
    >
      <template #prepend>
        <div class="brand">
          <div class="brand-logo-container">
            <img
              v-if="crmLogoUrl"
              :src="crmLogoUrl"
              alt="Logo"
              class="brand-logo"
              :style="{ transform: `translate(${branding.logoOffsetX || 0}px, ${branding.logoOffsetY || 0}px) scale(${branding.logoScale / 100})` }"
            />
            <div v-else class="brand-logo-placeholder">
              <v-icon icon="mdi-domain" size="20" color="white" />
            </div>
          </div>
          <span class="brand-text">{{ branding.nomeCRM || 'CRM' }}</span>
        </div>
      </template>

      <v-list nav density="comfortable">
        <v-list-item to="/" title="Home" prepend-icon="mdi-home" class="nav-item" />
        <v-list-item to="/clientes" title="Clientes" prepend-icon="mdi-account-group" class="nav-item" />
        <v-list-item
          v-if="modulesStore.enabledModules.leads"
          to="/leads"
          title="Leads"
          prepend-icon="mdi-filter-variant"
          class="nav-item"
        />

        <template v-if="modulesStore.produtoModulo === 'IMOBILIARIA' && modulesStore.enabledModules.imoveis">
          <v-list-item to="/imoveis" title="Empreendimentos" prepend-icon="mdi-domain" class="nav-item" />
          <v-list-item
            v-if="modulesStore.enabledModules.reservas"
            to="/vendas/reservas"
            title="Reservas"
            prepend-icon="mdi-calendar-clock"
            class="nav-item"
          />
        </template>

        <v-list-item
          v-if="modulesStore.produtoModulo === 'PADRAO' && modulesStore.enabledModules.produtos"
          to="/produtos"
          title="Produtos"
          prepend-icon="mdi-package-variant"
          class="nav-item"
        />

        <v-list-item
          v-if="modulesStore.enabledModules.negocios"
          to="/negocios"
          title="Negócios"
          prepend-icon="mdi-handshake"
          class="nav-item"
        />

        <v-list-group
          v-if="modulesStore.enabledModules.contasPagar || modulesStore.enabledModules.contasReceber"
          value="Financeiro"
        >
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="Financeiro" prepend-icon="mdi-bank" class="nav-item" />
          </template>
          <v-list-item
            v-if="modulesStore.enabledModules.contasPagar"
            to="/financeiro/pagar"
            title="Contas a Pagar"
            prepend-icon="mdi-cash-minus"
            class="nav-item"
          />
          <v-list-item
            v-if="modulesStore.enabledModules.contasReceber"
            to="/financeiro/receber"
            title="Contas a Receber"
            prepend-icon="mdi-cash-plus"
            class="nav-item"
          />
        </v-list-group>

        <v-list-item to="/configurar" title="Configurações" prepend-icon="mdi-cog" class="nav-item" />
      </v-list>

      <template #append>
        <div class="sidebar-footer">
          <v-list nav density="comfortable">
            <v-list-item @click="handleLogout" title="Sair" prepend-icon="mdi-logout" class="nav-item" />
          </v-list>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main class="main">
      <div class="top-shell" :class="{ 'mobile-header': mobile }">
        <div class="top-row">
          <v-btn v-if="mobile" icon="mdi-menu" variant="text" color="white" class="mr-n2" @click="drawer = !drawer" />
          
          <RouterLink v-if="mobile" to="/" class="top-brand" aria-label="Ir para Home">
            <div class="top-brand-logo">
              <img
                v-if="crmLogoUrl"
                :src="crmLogoUrl"
                alt="Logo"
                class="top-brand-logo-img"
                :style="{ transform: `translate(${branding.logoOffsetX || 0}px, ${branding.logoOffsetY || 0}px) scale(${branding.logoScale / 100})` }"
              />
              <v-icon v-else icon="mdi-domain" color="#d4a878" size="20" />
            </div>
            <span class="top-brand-text text-white">{{ branding.nomeCRM || 'CRM' }}</span>
          </RouterLink>



          <div v-if="!mobile" class="breadcrumbs-wrap">
            <Breadcrumbs />
          </div>
        </div>
        <div class="user-area">
          <v-btn icon variant="text" class="bell-btn" aria-label="Notificações">
            <v-icon icon="mdi-bell-outline" />
          </v-btn>
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn icon variant="text" class="user-trigger" v-bind="props">
                <v-avatar size="34" class="avatar" :class="{ 'mobile-avatar': mobile }">
                  <img v-if="userAvatar" :src="userAvatar" alt="Avatar do usuário" />
                  <span v-else>{{ userInitials }}</span>
                </v-avatar>
              </v-btn>
            </template>
            <v-card min-width="240" class="user-menu-card">
              <v-list>
                <v-list-item>
                  <v-list-item-title class="font-weight-bold">{{ userDisplayName }}</v-list-item-title>
                  <v-list-item-subtitle>{{ authStore.user?.email || 'Usuário logado' }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-divider />
              <v-list density="compact">
                <v-list-item prepend-icon="mdi-logout" title="Sair" @click="handleLogout" />
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </div>

      <div class="content" :class="{ 'mobile-content': mobile }">
        <RouterView />
      </div>

      <v-bottom-navigation v-if="mobile" grow color="primary">
        <v-btn to="/">
          <v-icon>mdi-home</v-icon>
          <span>Home</span>
        </v-btn>

        <v-btn to="/clientes">
          <v-icon>mdi-account-group-outline</v-icon>
          <span>Clientes</span>
        </v-btn>

        <v-btn to="/negocios">
          <v-icon>mdi-briefcase-outline</v-icon>
          <span>Negócios</span>
        </v-btn>

        <v-btn to="/configurar">
          <v-icon>mdi-cog-outline</v-icon>
          <span>Config</span>
        </v-btn>
      </v-bottom-navigation>

      <footer v-if="!mobile" class="global-footer">
        <div class="footer-content">
          <span class="footer-company">Powered by One Cup Tech Solutions</span>
          <img src="/one-cup-logo.png" alt="One Cup Tech Solutions" class="footer-logo" />
        </div>
      </footer>
    </v-main>

    <v-snackbar
      v-model="notificationsStore.show.value"
      :color="notificationsStore.color.value"
      :timeout="4000"
      location="top right"
      elevation="24"
    >
      <div class="d-flex align-center ga-2">
        <v-icon :icon="notificationsStore.icon.value" />
        <span>{{ notificationsStore.message.value }}</span>
      </div>
      <template #actions>
        <v-btn variant="text" @click="notificationsStore.show.value = false" icon="mdi-close" size="small"></v-btn>
      </template>
    </v-snackbar>
  </v-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router'
import { useDisplay } from 'vuetify'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBrandingStore } from '../stores/brandingStore'
import { useAuthStore } from '../stores/authStore'
import { useModulesStore } from '../stores/modulesStore'
import { notificationsStore } from '../stores/notificationsStore'

const router = useRouter()
const route = useRoute()
const brandingStore = useBrandingStore()
const { branding } = brandingStore
const authStore = useAuthStore()
const modulesStore = useModulesStore()

const { mobile } = useDisplay()
const drawer = ref(!mobile.value)
const crmLogoUrl = computed(() => (branding.value?.logoUrl || '').trim())

watch(mobile, (val) => {
  drawer.value = !val
})

watch(
  () => route.fullPath,
  () => {
    if (mobile.value) drawer.value = false
  },
)

onMounted(() => {
  brandingStore.carregarBrandingPublico()
  modulesStore.fetchConfig()
})

const userInitials = (() => {
  const rawName = authStore.user?.name?.trim()
  const rawEmail = authStore.user?.email?.trim()
  const source = rawName || rawEmail || 'Admin'
  const words = source
    .replace(/@.*/, '')
    .split(/\s+/)
    .filter(Boolean)

  if (words.length >= 2) {
    const first = words[0] || ''
    const second = words[1] || ''
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase()
  }

  const single = words[0] || 'AD'
  return single.slice(0, 2).toUpperCase().padEnd(2, 'D')
})()

const userDisplayName = authStore.user?.name?.trim() || 'Administrador'

const userAvatar = (() => {
  const user = authStore.user as any
  return user?.avatarUrl || user?.photoUrl || user?.fotoUrl || ''
})()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout {
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background:
    radial-gradient(500px 280px at 0% 0%, rgba(215, 177, 111, 0.12), transparent 62%),
    linear-gradient(180deg, #0d0f16 0%, #0a0c13 100%);
  color: #e9ddc6;
  border-right: 1px solid rgba(215, 177, 111, 0.22);
}

.sidebar :deep(.v-navigation-drawer__content) {
  display: flex !important;
  flex-direction: column !important;
}

.sidebar-footer {
  border-top: 1px solid rgba(215, 177, 111, 0.22);
  padding: 0.25rem 0;
}

.brand {
  padding: 1.2rem 1.1rem 0.9rem;
  font-weight: 700;
  font-size: 1.14rem;
  color: #f2e6d1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-logo-container {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(215, 177, 111, 0.46);
  background: radial-gradient(circle at 50% 40%, #f9e8cb 0%, #d3aa69 100%);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45);
}

.brand-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2px;
}

.brand-logo-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e2c283 0%, #a5763d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  line-height: 1;
  font-family: 'Cinzel', serif;
  letter-spacing: 0.06em;
}

.nav-item :deep(.v-list-item__prepend) {
  min-width: 26px;
  width: 26px;
  margin-inline-end: 8px;
  color: #e0c082;
}

.nav-item :deep(.v-list-item-title) {
  font-weight: 600;
  color: #e8dcc5;
}

.sidebar :deep(.v-list-group__items .v-list-item) {
  padding-inline-start: 18px !important;
}

.sidebar :deep(.v-list-item--active) {
  background: linear-gradient(90deg, rgba(215, 177, 111, 0.3) 0%, rgba(215, 177, 111, 0.04) 100%) !important;
  border: 1px solid rgba(215, 177, 111, 0.42);
}

.sidebar :deep(.v-list-item:hover) {
  background: rgba(215, 177, 111, 0.11);
}

.main {
  background:
    radial-gradient(1020px 560px at 84% -10%, rgba(215, 177, 111, 0.1), transparent 55%),
    radial-gradient(900px 700px at 0% 96%, rgba(86, 95, 124, 0.22), transparent 64%),
    linear-gradient(180deg, #0a0b10 0%, #0e1017 100%);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.top-shell {
  position: sticky;
  top: 0;
  z-index: 3;
  padding: 0.1rem 4.5rem 0.1rem 2rem;
  background: rgba(9, 11, 17, 0.78);
  border-bottom: 1px solid rgba(215, 177, 111, 0.16);
  backdrop-filter: blur(12px);
}

.top-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 40px;
  width: 100%;
  max-width: 1520px;
  margin: 0 auto;
}

.top-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  min-width: 0;
}

.top-brand-logo {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  border: 1px solid rgba(215, 177, 111, 0.32);
  background: rgba(215, 177, 111, 0.11);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  color: #d7b16f;
}

.top-brand-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center;
}

.top-brand-text {
  color: #f0e3c8;
  font-weight: 800;
  font-size: 0.95rem;
  line-height: 1;
  white-space: nowrap;
  font-family: 'Cinzel', serif;
  letter-spacing: 0.06em;
}

.breadcrumbs-wrap {
  min-width: 0;
  flex: 1 1 auto;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
}

.user-area {
  position: absolute;
  top: 3px;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.content {
  width: 100%;
  max-width: 1520px;
  margin: 0 auto;
  padding: 0.95rem 2rem 2rem;
  flex: 1 1 auto;
  overflow-y: auto;
}

.global-footer {
  background: linear-gradient(180deg, #10131b 0%, #0d1016 100%);
  border-top: 1px solid rgba(215, 177, 111, 0.18);
  padding: 0.45rem 2rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.v-bottom-navigation) {
  background: rgba(11, 13, 20, 0.96) !important;
  border-top: 1px solid rgba(215, 177, 111, 0.25);
}

:deep(.v-bottom-navigation .v-btn) {
  color: #cdbb95 !important;
}

:deep(.v-bottom-navigation .v-btn--active) {
  color: #f0d8ab !important;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.footer-logo {
  width: 30px;
  height: 30px;
  object-fit: contain;
  border-radius: 50%;
}

.footer-company {
  font-size: 0.8rem;
  color: #c9b78f;
  font-weight: 600;
}

.avatar {
  background: linear-gradient(135deg, #d8bc89 0%, #a97a41 100%);
  color: #15110b;
  font-weight: 700;
  border: 1px solid rgba(215, 177, 111, 0.3);
}

.user-trigger {
  margin-right: -6px;
}

.bell-btn {
  color: #dec38f;
  border: 1px solid rgba(215, 177, 111, 0.3);
  background: rgba(215, 177, 111, 0.08);
}

.user-menu-card {
  border-radius: 12px;
  border: 1px solid rgba(215, 177, 111, 0.24);
  background: #141822;
  color: #f0e8db;
}

.avatar :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 1100px) {
  .top-shell,
  .content {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .user-area {
    right: 1rem;
  }
}

@media (max-width: 768px) {
  .top-shell {
    padding: 0.35rem 1rem;
    transition: background 0.3s;
  }
  
  .top-shell.mobile-header {
    background: #0f121a;
    border-bottom: 1px solid rgba(215, 177, 111, 0.2);
    padding: 0.75rem 1rem;
  }

  .top-shell.mobile-header .top-brand-logo {
     background: rgba(215, 177, 111, 0.1);
     border: 1px solid rgba(215, 177, 111, 0.3);
  }

  .avatar.mobile-avatar {
    background: linear-gradient(135deg, #d8bc89 0%, #a97a41 100%);
    color: #15110b;
    border: 1px solid rgba(215, 177, 111, 0.3);
  }
  
  .mobile-content {
      padding-bottom: 60px !important; /* Space for bottom nav */
  }

  .top-row {
    min-height: 34px;
    gap: 0.5rem;
  }

  .top-brand-logo {
    width: 28px;
    height: 28px;
    border-radius: 8px;
  }

  .top-brand-text {
    font-size: 0.9rem;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .content {
    padding: 0.7rem 0.6rem 1rem;
  }

  .user-area {
    right: 0.6rem;
    top: 4px;
  }

  .global-footer {
    padding: 0.35rem 0.5rem;
  }

  .footer-company {
    font-size: 0.72rem;
  }

  .footer-logo {
    width: 22px;
    height: 22px;
  }
}
</style>
