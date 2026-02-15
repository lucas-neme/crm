<template>
  <v-app>
    <v-main>
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useBrandingStore } from './stores/brandingStore'

const brandingStore = useBrandingStore()
const route = useRoute()

// Update document title based on route and branding
const updateTitle = () => {
  const crmName = brandingStore.branding.value.nomeCRM || 'CRM'
  const pageTitle = (route.meta?.title as string) || (route.name ? String(route.name) : '')
  
  if (pageTitle && pageTitle !== 'Home' && pageTitle !== 'CRM') {
    document.title = `${pageTitle} | ${crmName}`
  } else {
    document.title = crmName
  }
}

// Watch for changes in branding to update browser meta
watch(
  () => brandingStore.branding.value,
  (newBranding) => {
    if (!newBranding) return

    updateTitle()

    // Update Favicon
    if (newBranding.logoUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = newBranding.logoUrl
    }
  },
  { immediate: true, deep: true }
)

// Watch route to update title when navigating
watch(() => route.path, updateTitle)

console.log('App.vue carregado')
</script>

<style scoped>
</style>

