<script setup vapor>
import { useRoute } from 'vue-router';
import Navbar from '@/components/Navbar.vue';

const route = useRoute()
</script>

<template>
    <div class="flex flex-row">
        <Navbar v-if="!route.meta.hideNavbar" />
        <div>
            <router-view />
        </div>
    </div>
</template>