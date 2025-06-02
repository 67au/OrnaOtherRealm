import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'

import App from './App.vue'
import router from '@/router'
import { i18n, vuetifyLocale } from '@/i18n'
import { md3 } from 'vuetify/blueprints'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2'

import { themes } from '@/styles/themes'
import { defaultTheme } from '@/styles'

import 'vuetify/styles'

const app = createApp(App)

const vuetify = createVuetify({
  locale: vuetifyLocale,
  defaults: {
    global: {
      density: 'comfortable',
    },
    VCard: {
      elevation: 2,
    },
  },
  theme: {
    defaultTheme: defaultTheme,
    themes: themes,
  },
  blueprint: md3,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})

const persistedStatePlugin = createPersistedStatePlugin()

const pinia = createPinia()
pinia.use(persistedStatePlugin)

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(vuetify)

app.mount('#app')
