import { useAuthStore } from "@/stores/useAuthStore";
import { createPinia } from "pinia";
import { createApp, vaporInteropPlugin } from "vue";
import App from "./App.vue";
import router from "./router";
(async () => {
  const app = createApp(App);
  const pinia = createPinia();

  app.use(pinia);

  const auth = useAuthStore();
  await auth.fetchUserData(); // restore session — no listener yet

  window.addEventListener("auth:unauthorized", () => {
    auth.$reset();
  });

  app.use(router);
  app.use(vaporInteropPlugin);
  app.mount("#app");

  // auth.listenToAuthChanges()
})();
