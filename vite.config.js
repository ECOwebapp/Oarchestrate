import { fileURLToPath, URL } from 'node:url'
import handler from './api/upload-to-drive.js' // Import your logic
import { defineConfig } from 'vite'
import VueRouter from 'unplugin-vue-router/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    VueRouter({
      routesFolder: 'src/views/', // This is where your files will live
    }),
    vueDevTools(), 
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
