import { useAuthStore } from '@/stores/useAuthStore';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
(async () => {
  const app   = createApp(App)
  const pinia = createPinia()

  app.use(pinia)

  const auth = useAuthStore()
  await auth.init()       // restore session — no listener yet

  app.use(router)
  app.mount('#app')

  // Register AFTER mount so reactive updates from auth events
  // never fire while the component tree is still being set up
  auth.listenToAuthChanges()
})()
