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
  <div class="flex flex-col items-center shrink-0 cursor-pointer transition-all duration-300 hover:-translate-y-1" :style="{ width: sz.w }">
    <div
      class="rounded-full flex items-center justify-center mb-[6px] shrink-0 border-2 border-white/70 shadow-[0_3px_10px_rgba(27,94,63,0.28)]"
      :style="{ width: sz.av, height: sz.av, background: 'linear-gradient(135deg, #1b5e3f 0%, #2d8659 100%)' }">
      <img v-if="person?.avatarUrl" :src="person?.avatarUrl" alt="" class="w-full h-full rounded-full object-cover">
      <svg v-else fill="#ffffff" viewBox="0 0 24 24" class="w-[55%] h-[55%]">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
      </svg>
    </div>

    <div class="w-full rounded-[6px] bg-[#2d3436] text-white px-[6px] py-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
      <p
        class="font-bold leading-[1.2] text-center uppercase font-['Hammersmith_One',sans-serif] overflow-hidden text-ellipsis"
        :style="{ fontSize: sz.nm, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: '2' }">
        {{ person?.name }}
      </p>
      <p
        class="leading-[1.15] mt-[1px] text-center text-white/80 font-['Hammersmith_One',sans-serif] overflow-hidden text-ellipsis"
        :style="{ fontSize: sz.ti, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: '2' }">
        {{ person?.title }}
      </p>
    </div>
  </div>
</template>