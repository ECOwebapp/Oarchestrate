<script setup>
import { ref } from 'vue'

const props = defineProps({
  title:    { type: String, default: 'Generate Report' },
  subtitle: { type: String, default: 'Select the period to generate the report for.' },
})

const emit = defineEmits(['generate', 'cancel'])

const month = ref(new Date().getMonth() + 1)
const year  = ref(new Date().getFullYear())

const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
const years  = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="emit('cancel')">
    <div class="bg-white rounded-xl shadow-2xl p-6 w-80">
      <h2 class="text-sm font-bold text-gray-800 mb-1">{{ title }}</h2>
      <p class="text-[11px] text-gray-400 mb-4">{{ subtitle }}</p>

      <div class="flex flex-col gap-3">
        <div>
          <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Month</label>
          <select v-model.number="month"
            class="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-green-700">
            <option :value="0">All Months</option>
            <option v-for="(m, i) in months" :key="i" :value="i + 1">{{ m }}</option>
          </select>
        </div>
        <div>
          <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Year</label>
          <select v-model.number="year"
            class="w-full text-sm border border-gray-200 rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-green-700">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <div class="flex gap-2 mt-5">
        <button @click="emit('cancel')"
          class="flex-1 py-2 text-xs font-semibold rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
          Cancel
        </button>
        <button @click="emit('generate', { month, year })"
          class="flex-1 py-2 text-xs font-bold rounded-md bg-green-900 text-white hover:bg-green-800 cursor-pointer transition-colors">
          Generate
        </button>
      </div>
    </div>
  </div>
</template>
