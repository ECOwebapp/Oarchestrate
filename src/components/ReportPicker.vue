<script setup>
import { ref } from 'vue'

const props = defineProps({
  title:    { type: String, default: 'Generate Report' },
  subtitle: { type: String, default: 'Select the period to generate the report for.' },
  payroll:  { type: Boolean, default: false },
})

const emit = defineEmits(['generate', 'cancel'])

const month        = ref(new Date().getMonth() + 1)
const year         = ref(new Date().getFullYear())
const payrollPeriod = ref(1) // 1 = 1st–15th, 2 = 16th–end

const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
const years  = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

function generate() {
  if (props.payroll) {
    const yr  = year.value
    const mo  = month.value
    const pad = String(mo).padStart(2, '0')
    const lastDay = new Date(yr, mo, 0).getDate()
    const dateFrom = payrollPeriod.value === 1 ? `${yr}-${pad}-01` : `${yr}-${pad}-16`
    const dateTo   = payrollPeriod.value === 1 ? `${yr}-${pad}-15` : `${yr}-${pad}-${lastDay}`
    emit('generate', { dateFrom, dateTo, month: mo, year: yr, payrollPeriod: payrollPeriod.value })
  } else {
    emit('generate', { month: month.value, year: year.value })
  }
}
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
            <option v-if="!payroll" :value="0">All Months</option>
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
        <!-- Payroll period selector -->
        <div v-if="payroll">
          <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Payroll Period</label>
          <div class="flex gap-2">
            <button
              :class="['flex-1 py-2 text-xs font-semibold rounded-md border transition-colors cursor-pointer',
                payrollPeriod === 1 ? 'bg-green-900 text-white border-green-900' : 'border-gray-200 text-gray-500 hover:bg-gray-50']"
              @click="payrollPeriod = 1">
              1st (1–15)
            </button>
            <button
              :class="['flex-1 py-2 text-xs font-semibold rounded-md border transition-colors cursor-pointer',
                payrollPeriod === 2 ? 'bg-green-900 text-white border-green-900' : 'border-gray-200 text-gray-500 hover:bg-gray-50']"
              @click="payrollPeriod = 2">
              2nd (16–end)
            </button>
          </div>
        </div>
      </div>

      <div class="flex gap-2 mt-5">
        <button @click="emit('cancel')"
          class="flex-1 py-2 text-xs font-semibold rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors">
          Cancel
        </button>
        <button @click="generate"
          class="flex-1 py-2 text-xs font-bold rounded-md bg-green-900 text-white hover:bg-green-800 cursor-pointer transition-colors">
          Generate
        </button>
      </div>
    </div>
  </div>
</template>
