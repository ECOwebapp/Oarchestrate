<script setup vapor>
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Navbar from '@/components/Navbar.vue'
import NotificationWidget from '@/components/Notification.vue'
import { useAuthStore } from '@/stores/useAuthStore';
import { ref, onMounted } from 'vue'
import Icons from '@/components/Icons.vue';

const auth = useAuthStore()
const videoRef = ref(null)
onMounted(async () => {
    await auth.fetchUserData(auth.user, true)

    if (videoRef.value) {
    videoRef.value.play().catch(error => {
      console.warn("Autoplay was prevented by the browser:", error)
    })
  }
})
</script>

<template>
    <div v-if="auth.loading" class="flex flex-col items-center justify-center gap-5 w-full h-screen overflow-hidden">
        <!-- <Icons class=" text-grey-500/50 text-lg" :icon="'spin'" /> -->

        <video ref="videoRef" src="../../public/images/CSU-LOGO-ANIMATION.mp4" loop muted playsinline class="w-50 h-50 animate-spin" />

        <p class="animate-pulse text-gray-500/90 text-sm">Oarchestrating the system. Please standby...</p>
    </div>
    <div v-else class="flex flex-row w-full h-screen overflow-hidden">

        <Navbar />

        <div class="flex flex-col flex-1 min-w-0">
            <header class="w-full flex-shrink-0">
                <Header />
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
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>