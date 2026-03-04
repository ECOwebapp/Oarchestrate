<script setup>
import Footer from '@/components/Footer.vue';
import Header from '@/components/Header.vue';
import Navbar from '@/components/Navbar.vue';
import { useRoute } from 'vue-router';

const route = useRoute()
</script>

<template>
    <div class="flex flex-row w-full h-screen overflow-hidden absolute" v-if="!route.meta.hideNavbar">
        <Navbar class="w-64 h-full flex-shrink-0 hidden xl:flex" />
        <div class="flex flex-col flex-1 min-w-0">
            <header class="w-full content-center flex-shrink-0">
                <Header :pageName="route.name" />
            </header>
            <main class="flex flex-col h-full overflow-hidden flex-1 bg-gray-100">
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