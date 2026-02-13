import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'CRM Imobiliário',
        short_name: 'CRM',
        description: 'Aplicação de Gestão Imobiliária',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'one-cup-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'one-cup-logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
