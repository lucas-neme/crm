<template>
  <v-layout class="layout">
    <v-navigation-drawer permanent width="232" class="sidebar">
      <div class="brand">
        <div class="brand-logo-container">
          <img
            v-if="branding.logoUrl"
            :src="branding.logoUrl"
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

      <v-list nav density="comfortable">
        <v-list-item to="/" title="Home" prepend-icon="mdi-home" class="nav-item" />
        <v-list-item to="/clientes" title="Clientes" prepend-icon="mdi-account-group" class="nav-item" />
        <v-list-item to="/leads" title="Leads" prepend-icon="mdi-filter-variant" class="nav-item" />

        <template v-if="modulesStore.produtoModulo === 'IMOBILIARIA'">
          <v-list-item to="/imoveis" title="Empreendimentos" prepend-icon="mdi-domain" class="nav-item" />
          <v-list-item to="/vendas/reservas" title="Reservas" prepend-icon="mdi-calendar-clock" class="nav-item" />
        </template>

        <v-list-item
          v-if="modulesStore.produtoModulo === 'PADRAO'"
          to="/produtos"
          title="Produtos"
          prepend-icon="mdi-package-variant"
          class="nav-item"
        />

        <v-list-item to="/negocios" title="Negócios" prepend-icon="mdi-handshake" class="nav-item" />

        <v-list-group value="Financeiro">
          <template #activator="{ props }">
            <v-list-item v-bind="props" title="Financeiro" prepend-icon="mdi-bank" class="nav-item" />
          </template>
          <v-list-item to="/financeiro/pagar" title="Contas a Pagar" prepend-icon="mdi-cash-minus" class="nav-item" />
          <v-list-item to="/financeiro/receber" title="Contas a Receber" prepend-icon="mdi-cash-plus" class="nav-item" />
        </v-list-group>

        <v-list-item to="/configurar" title="Configurações" prepend-icon="mdi-cog" class="nav-item" />
      </v-list>

      <div class="sidebar-spacer"></div>

      <v-list nav density="comfortable" class="sidebar-bottom">
        <v-list-item @click="handleLogout" title="Sair" prepend-icon="mdi-logout" class="nav-item" />
      </v-list>
    </v-navigation-drawer>

    <v-main class="main">
      <div class="top-shell">
        <div class="top-row">
          <Breadcrumbs />
        </div>
        <div class="user-area">
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn icon variant="text" class="user-trigger" v-bind="props">
                <v-avatar size="34" class="avatar">
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

      <div class="content">
        <RouterView />
      </div>

      <footer class="global-footer">
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
import { onMounted } from 'vue'
import { useRouter, RouterView } from 'vue-router'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import { useBrandingStore } from '../stores/brandingStore'
import { useAuthStore } from '../stores/authStore'
import { useModulesStore } from '../stores/modulesStore'
import { notificationsStore } from '../stores/notificationsStore'

const router = useRouter()
const { branding } = useBrandingStore()
const authStore = useAuthStore()
const modulesStore = useModulesStore()

onMounted(() => {
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
  min-height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, #172236 0%, #0e1a2e 100%);
  color: #dbe7f8;
  border-right: 1px solid rgba(105, 131, 171, 0.25);
}

.sidebar :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.brand {
  padding: 1.4rem 1.25rem 1rem;
  font-weight: 700;
  font-size: 1.2rem;
  color: #fff;
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
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
}

.brand-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform-origin: center;
  border-radius: 50%;
}

.brand-logo-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2f83ff 0%, #1e5aaf 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  line-height: 1;
}

.sidebar-spacer {
  flex: 1 1 auto;
}

.sidebar-bottom {
  margin-top: auto;
  margin-bottom: 0.75rem;
}

.nav-item :deep(.v-list-item__prepend) {
  min-width: 26px;
  width: 26px;
  margin-inline-end: 8px;
}

.nav-item :deep(.v-list-item-title) {
  font-weight: 600;
}

.sidebar :deep(.v-list-group__items .v-list-item) {
  padding-inline-start: 18px !important;
}

.main {
  background:
    radial-gradient(1200px 600px at 80% -120px, rgba(115, 169, 255, 0.2), transparent 55%),
    linear-gradient(180deg, #edf3fb 0%, #e7eef7 100%);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.top-shell {
  position: sticky;
  top: 0;
  z-index: 3;
  padding: 0.1rem 4.5rem 0.1rem 2rem;
  background: rgba(231, 238, 247, 0.82);
  backdrop-filter: blur(8px);
}

.top-row {
  display: flex;
  align-items: center;
  min-height: 40px;
  width: 100%;
  max-width: 1520px;
  margin: 0 auto;
}

.user-area {
  position: absolute;
  top: 3px;
  right: 2rem;
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
  background: linear-gradient(180deg, #e9f2ff 0%, #dbeafe 100%);
  border-top: 1px solid #bfd6f7;
  padding: 0.45rem 2rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
  color: #1a4f8f;
  font-weight: 600;
}

.avatar {
  background: #cedefc;
  color: #19385e;
  font-weight: 700;
  border: 1px solid #aabccf;
}

.user-trigger {
  margin-right: -6px;
}

.user-menu-card {
  border-radius: 12px;
  border: 1px solid #d6e0ee;
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
</style>
