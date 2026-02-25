<script setup vapor>

const name = "Dashboard"
const description = "View summary of analytics and tasks"
</script>

<template>
    <div class="flex items-center justify-between px-10 h-25
            bg-green-900 bg-[url('/images/csu_admin_building.png')] bg-cover bg-center bg-blend-multiply">
        <div class="flex flex-col text-white max-w-[20rem] text-wrap">
            <p class="text-xl font-bold">{{ name }}</p>
            <p class="text-sm italic">{{ description }}</p>
        </div>

        <div class="h-25 w-25 bg-[url('/images/csu_seal.png')] bg-contain bg-center bg-no-repeat"></div>
    </div>
</template>