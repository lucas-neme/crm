// @ts-ignore
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'nemer',
    themes: {
      nemer: {
        dark: true,
        colors: {
          background: '#0b0b11',
          surface: '#12131b',
          primary: '#d7b16f',
          secondary: '#1d2434',
          success: '#4a9a69',
          warning: '#c98f43',
          error: '#c75f5f',
          info: '#6e8fb6',
        },
      },
    },
  },
  defaults: {
    VCard: {
      rounded: 'lg',
      elevation: 0,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VBtn: {
      rounded: 'lg',
      style: 'letter-spacing: .01em; text-transform: none; font-weight: 700;',
    },
  },
})
