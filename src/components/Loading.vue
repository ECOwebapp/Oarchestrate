<script setup vapor>

defineProps(['message'])

</script>

<template>
    <!-- <div class="flex-1 flex items-center justify-center gap-3">
      <svg class="animate-spin w-5 h-5 text-green-700" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#d1fae5" stroke-width="3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <span class="text-sm text-gray-500 tracking-wide">Loading…</span>
    </div> -->
    <div class="flex flex-col items-center justify-center gap-5 w-full h-screen overflow-hidden bg-white">
      <div class="w-20 h-20 animate-spin bg-[url('/images/csu_seal.png')] bg-cover bg-center no-repeat" />

      <p class="animate-pulse text-gray-500/70 text-sm">{{ message }}</p>
    </div>
</template>