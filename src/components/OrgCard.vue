<script setup>
defineProps({
  person: {
    type: Object,
    required: true
  },
  sz: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="flex flex-col items-center bg-white border border-black rounded-[10px] shrink-0 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md" :style="{ width: sz.w, padding: sz.p }">
    <div class="rounded-full bg-[#D9D9D9] flex items-center justify-center mb-[2px] shrink-0" :style="{ width: sz.av, height: sz.av }">
      <img v-if="person?.avatarUrl" :src="person?.avatarUrl" alt="" class="rounded-full bg-cover bg-center no-repeat">
      <svg v-else fill="#9ca3af" viewBox="0 0 24 24" class="w-[55%] h-[55%]">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>
    </div>
    <p class="font-bold text-black leading-tight break-words font-['Hammersmith_One',sans-serif] text-center" :style="{ fontSize: sz.nm }">
      {{ person?.name }}
    </p>
    <p class="text-[#444] leading-[1.1] mt-[1px] break-words font-['Hammersmith_One',sans-serif] text-center" :style="{ fontSize: sz.ti }">
      {{ person?.title }}
    </p>
  </div>
</template>