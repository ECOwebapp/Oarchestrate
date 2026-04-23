<script setup vapor>
import Icons from './Icons.vue'
import { computed } from 'vue'

const props = defineProps({
  navNames: Array,
  getPath: Function,
  isActive: Function,
  authStore: Object,
  expanded: Boolean,
  version: String,
  formattedPositions: String,
  formattedUnits: String,
})

defineEmits(['logout', 'navigate'])

// Dynamic styles for the avatar
const avatarContainerStyle = computed(() => ({
  width: props.expanded ? '115px' : '50px',
  height: props.expanded ? '115px' : '50px',
  marginBottom: props.expanded ? '10px' : '6px',
  borderRadius: '9999px',
  backgroundColor: props.authStore.avatarColor ?? '#14532d',
}))

const avatarFontSize = computed(() => props.expanded ? '64px' : '32px')
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <div
      class="relative flex flex-col items-center justify-end flex-shrink-0 overflow-hidden bg-[url('/images/bg_profile.jpg')] h-[220px] bg-center bg-cover no-repeat">
      <div class="absolute inset-0"
        style="background: linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(6,46,20,0.88) 100%)" />

      <div class="relative z-10 flex flex-col items-center w-full pb-4 px-3">
        <div :style="avatarContainerStyle"
          class="flex items-center justify-center transition-all duration-300 shadow-xl border-white/30 border-[2px] overflow-hidden">
          <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" @error="(e) => { e.target.style.display = 'none'; authStore.avatarUrl = null;
          }" class="w-full h-full object-cover block" />

          <span v-else :style="{
            fontSize: avatarFontSize,
            transition: 'font-size 0.3s ease'
          }" class="text-white font-bold tracking-wider drop-shadow-md select-none">
            {{ authStore.initials || '?' }}
          </span>
        </div>

        <template v-if="!authStore.loading && authStore.initialized">
          <div v-if="expanded" class="text-center">
            <p class="text-white text-sm font-bold leading-tight truncate max-w-[180px]">
              {{ authStore.fullName }}
            </p>
            <p class="text-green-300 text-[13px] font-bold truncate mt-0.5 max-w-[180px]">
              {{ formattedPositions }}
            </p>
            <p class="text-white text-[12px] leading-tight max-w-[180px]">
              {{ formattedUnits }}
            </p>
          </div>
        </template>

        <div v-else class="flex flex-col items-center gap-1.5">
          <div class="h-3 w-28 rounded bg-white/20 animate-pulse"></div>
          <div v-show="expanded" class="h-2.5 w-20 rounded bg-white/15 animate-pulse"></div>
        </div>
      </div>
    </div>

    <ul class="flex flex-col flex-1 py-2 overflow-hidden">
      <li v-for="(name, i) in navNames" :key="name">
        <router-link :to="getPath(name)" @click="$emit('navigate')"
          class="group relative flex flex-row items-center gap-0 py-3 mx-2 rounded-xl transition-all duration-150 overflow-hidden"
          :class="isActive(name) ? 'bg-green-950 text-white' : 'text-black hover:bg-black/10'"
          :style="{ animation: `navIn 0.35s cubic-bezier(.16,1,.3,1) both`, animationDelay: `${i * 35}ms` }">
          <span v-if="isActive(name)"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full"></span>

          <Icons :icon="name.toLowerCase()" class="flex-shrink-0 transition-transform duration-150 mx-4"
            :class="!isActive(name) ? 'group-hover:scale-110' : ''" />

          <span v-if="expanded"
            class="text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 mr-4">
            {{ name }}{{ name === 'Design' ? ' Review' : '' }}
          </span>

          <span v-if="!expanded"
            class="pointer-events-none absolute left-full ml-2 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-green-900 text-white shadow-lg">
            {{ name }}
          </span>
        </router-link>
      </li>
    </ul>

    <div class="flex-shrink-0 border-t border-white/10 p-2">
      <button @click="$emit('logout')"
        class="group relative w-full flex flex-row items-center rounded-xl py-3 mx-0 overflow-hidden text-red-600 hover:bg-red-500/30 hover:cursor-pointer transition-all duration-150">
        <Icons icon="logout" class="flex-shrink-0 mx-4 transition-transform duration-150 group-hover:translate-x-0.5" />
        <span v-if="expanded" class="text-sm font-medium mr-4">Logout</span>
      </button>
      <p v-if="expanded" class="text-center text-[10px] text-green-700 mt-1.5 tracking-widest">v{{ version }}</p>
    </div>
  </div>
</template>