<script setup vapor>
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

const route = useRoute()
</script>

<template>
    <div>
        <div class="flex flex-row w-full h-screen overflow-hidden absolute" v-if="!route.meta.hideNavbar">
            <Navbar class="w-55 h-full flex-shrink-0 hidden xl:flex" />
            <div class="flex flex-col flex-1 min-w-0">
                <header class="w-full content-center flex-shrink-0">
                    <Header :pageName="route.name" />
                </header>
                <main class="flex flex-col h-full overflow-hidden flex-1 bg-gray-100">
                    <router-view/>
                </main>
                <footer class="w-full content-center flex-shrink-0">
                    <Footer />
                </footer>
            </div>
        </div>

        <div v-else>
            <router-view />
        </div>
    </div>
</template>