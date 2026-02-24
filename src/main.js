import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { vaporInteropPlugin } from 'vue'

const app = createApp(App)

app.use(createPinia()).use(router).use(vaporInteropPlugin).mount('#app')
