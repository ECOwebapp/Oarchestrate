<script setup vapor>
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import Header from '@/components/Header.vue';

const route = useRoute()
</script>

<template>
    <div class="flex flex-row w-full h-screen overflow-hidden">
        <Navbar class="w-64 h-full flex-shrink-0" v-if="!route.meta.hideNavbar" />
        <div class="flex flex-col flex-1 min-w-0">
            <header class="w-full content-center flex-shrink-0">
                <Header />
            </header>
            <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
                <router-view />
            </main>
        </div>

    </div>
</template>