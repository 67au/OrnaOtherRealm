import { createApp } from 'vue'
import Varlet from '@varlet/ui'
import '@varlet/ui/es/style'
import '@varlet/touch-emulator'
import { createI18n } from 'vue-i18n'
import { Locale } from '@varlet/ui'

import App from './App.vue'

import AppHeader from './components/AppHeader.vue'

const browserLocale = navigator.language || navigator.userLanguage;

const langs = {
    'zh-CN': 'zh-hans',
    'zh-TW': 'zh-hant',
    'zh-HK': 'zh-hant',
    'en-US': 'en',
}

const i18n = createI18n({
    locale: langs[browserLocale],
    fallbackLocale: 'en',
    messages: {
        'zh-hans': {
            'preview_button': '预览',
            'generate_button': '生成',
            'realm': '重生界门',
            'raids': '副本',
        },
        'zh-hant': {
            'preview_button': '預覽',
            'generate_button': '生成',
            'realm': '重生傳送門',
            'raids': '副本',
        },
        'en': {
            'preview_button': 'Preview',
            'generate_button': 'Generate',
            'realm': 'Arisen Gateway',
            'raids': 'Raids',
        },
    }
})

Locale.add('zh-hans', Locale.zhCN)
Locale.add('zh-hant', Locale.zhTW)
Locale.add('en', Locale.enUS)

const app = createApp(App)

app.component('AppHeader', AppHeader)
app.use(Varlet).use(i18n).mount('#app')