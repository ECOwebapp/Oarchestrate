<script setup>
const props = defineProps(['error'])

</script>

<template>
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm text-red-600 max-w-sm text-center">
        <p class="font-bold mb-1">Failed to load tasks</p>
        <p class="text-xs">{{ error }}</p>
      </div>
    </div>
</template>