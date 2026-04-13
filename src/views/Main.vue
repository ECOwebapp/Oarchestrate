<script setup vapor>
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'
import Navbar from '@/components/Navbar.vue'
import NotificationWidget from '@/components/Notification.vue'
import { useAuthStore } from '@/stores/useAuthStore';
import { ref, onMounted } from 'vue'
import Loading from '@/components/Loading.vue';

const auth = useAuthStore()
const videoRef = ref(null)
onMounted(async () => {
    if (videoRef.value) {
        videoRef.value.play().catch(error => {
            console.warn("Autoplay was prevented by the browser:", error)
        })
    }
})
</script>

<template>
    <div>
        <Loading v-if="auth.loading" :message="'Oarchestrating the system. Please standby...'" />
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