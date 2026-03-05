import { useAuthStore } from '@/stores/useAuthStore';
import { createPinia } from 'pinia';
import { createApp, vaporInteropPlugin } from 'vue'
import App from './App.vue';
import router from './router';

const app   = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vaporInteropPlugin)
app.mount('#app')

(async () => {

  const auth = useAuthStore()
  await auth.init()       // restore session — no listener yet


  // Register AFTER mount so reactive updates from auth events
  // never fire while the component tree is still being set up
  auth.listenToAuthChanges()
})()
