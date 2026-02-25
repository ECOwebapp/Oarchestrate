<script setup vapor>
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

const route = useRoute()
</script>

<template>
    <div class="flex flex-row w-full h-screen overflow-hidden" v-if="!route.meta.hideNavbar">
        <Navbar class="w-64 h-full flex-shrink-0" />
        <div class="flex flex-col flex-1 min-w-0">
            <header class="w-full content-center flex-shrink-0">
                <Header :pageName="route.name" />
            </header>
            <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
                <router-view />
            </main>
            <footer class="w-full content-center flex-shrink-0">
                <Footer />
            </footer>
        </div>
    </div>

    <div v-else>
        <router-view />
    </div>
</template>