import { createPinia } from 'pinia'
import { createApp, vaporInteropPlugin } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore';

import App from './App.vue'
import router from './router'

const app = createApp(App)
const auth = useAuthStore()

(async () => {
    app.use(createPinia())
    await auth.init()
    app.use(router).use(vaporInteropPlugin).mount('#app')
    auth.listenToAuthChanges()
})()
