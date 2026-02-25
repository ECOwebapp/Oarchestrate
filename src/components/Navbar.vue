<script setup>
import { ref } from 'vue'
import Icons from './Icons.vue';

const navNames = [
    'Dashboard',
    'Tasks',
    'Design',
    'Organization',
    'Analytics',
    'Profile',
    'Logout'
]

const getPath = (name) => {
    return `/${name.toLowerCase()}`;
}

const profile = "/images/profile.jpg"
const name = "Austin Rey A. Manlangit"
const position = "Director"
const version = "0.1 alpha"
</script>

<template>
    <nav class="flex flex-col bg-white drop-shadow-md">
        <div class="flex flex-col justify-center items-center
                w-full h-60 bg-[url('/images/bg_profile.jpg')] 
                contrast-100 bg-cover bg-top-left">
            <div class="w-30 h-30 mb-5 bg-cover bg-center rounded-full"
                :style="{ backgroundImage: `url(${profile})` }" />
            <p class="max-w-50 text-sm text-white text-wrap text-center font-bold">{{ name }}</p>
            <p class="max-w-50 text-sm text-white text-wrap text-center">{{ position }}</p>
        </div>

        <ul class="flex flex-col flex-1 bg-[url('/images/csu.png')] bg-cover bg-center">
            <li v-for="names in navNames" :key="names" :class="names === 'Logout' ? 'mt-auto' : ''">
                <RouterLink :to="getPath(names)" class="flex flex-row py-5 hover:bg-green-950 hover:text-white">
                    <Icons :icon="names.toLowerCase()" class="mx-5" />
                    <span class="mx-5">{{ names }}</span>
                </RouterLink>
            </li>
        </ul>
        <div class="flex border-t py-5 justify-center">
            <p>v{{ version }}</p>
        </div>
    </nav>
</template>