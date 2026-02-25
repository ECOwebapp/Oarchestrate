<script setup vapor>
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';

const route = useRoute()
</script>

<template>
    <div class="flex flex-row h-screen overflow-hidden">
        <Navbar v-if="!route.meta.hideNavbar" />
        <div class="flex-1 h-full min-h-0 overflow-hidden">
            <router-view />
        </div>
    </div>
</template>