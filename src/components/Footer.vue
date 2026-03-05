<script setup vapor>

const year = new Date().getFullYear()

</script>

<template>
    <footer class="flex flex-col items-center justify-center bg-green-950 text-white h-12">
        <p class="text-sm font-bold">Bugsay, Engineering and Construction Office!</p>
        <p class="text-xs">© Caraga State University {{ year }}</p>
    </footer>
</template>