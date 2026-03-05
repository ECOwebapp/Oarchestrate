<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import Icons from './Icons.vue';
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const authStore = useAuthStore()
const route = useRoute()
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

const currentTime = ref('')

const updateTime = () => {
  const now = new Date()
  
  // Format: dd/mm/yyyy, HH:mm:ss AM/PM
  currentTime.value = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(now).replace(',', '') // Removes the comma between date and time
}

let timer
onMounted(() => {
  updateTime() // Set initial time
  timer = setInterval(updateTime, 1000) // Update every second
})

onUnmounted(() => {
  clearInterval(timer)
})

const handleLogout = async (e) => {
    // 1. Stop the RouterLink from actually moving to /logout
    e.preventDefault() 

    // 2. Run your logout logic
    console.log("Grace is logging you out...")
    await authStore.logout()

    // 3. Redirect to login
    router.push('/login')
}
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
                <RouterLink :to="getPath(names)" class="flex flex-row items-center py-5 hover:bg-gray-400/50 hover:text-black"
                    @click="(e) => names === 'Logout' && handleLogout(e)"
                    :class="route.name === names ? 'bg-green-950 text-white hover:bg-green-950 hover:text-white font-bold' : ''">
                    <Icons :icon="names.toLowerCase()" class="ml-7" />
                    <span class="mx-5 text-md">{{ names }} {{ names === 'Design' ? 'Review' : '' }}</span>
                </RouterLink>
            </li>
        </ul>
        <div class="flex border-t h-12 items-center justify-center">
            <p>{{ currentTime }}</p>
        </div>
    </nav>
</template>