<script setup>
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Navbar from '@/components/Navbar.vue'
import NotificationWidget from '@/components/Notification.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div v-if="!route.meta.hideNavbar"
       class="flex flex-row w-full h-screen overflow-hidden">

    <Navbar />

    <div class="flex flex-col flex-1 min-w-0">
      <header class="w-full flex-shrink-0">
        <Header :pageName="route.name" />
      </header>
      <main class="flex flex-col flex-1 overflow-hidden bg-gray-100">
        <RouterView />
      </main>
      <footer class="w-full flex-shrink-0">
        <Footer />
      </footer>
    </div>

    <NotificationWidget />
  </div>

  <div v-else>
    <RouterView />
  </div>
</template>