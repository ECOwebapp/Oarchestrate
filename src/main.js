import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { vaporInteropPlugin } from 'vue'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(vaporInteropPlugin).use(createPinia()).use(router).mount('#app')
