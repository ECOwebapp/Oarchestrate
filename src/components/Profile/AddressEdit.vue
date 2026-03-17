<script setup>
import { ref, onMounted, watch, computed } from 'vue'

const PSGC = 'https://psgc.gitlab.io/api'

// ── PSGC data ──
const regions   = ref([])
const provinces = ref([])
const cities    = ref([])
const barangays = ref([])

const loadingRegions   = ref(false)
const loadingProvinces = ref(false)
const loadingCities    = ref(false)
const loadingBarangays = ref(false)
const loadingDropdowns = ref(true)

const props = defineProps(['form', 'errors'])

console.log(props.form)

// ── Load static dropdowns + regions on mount ──
onMounted(async () => {
  const [r] = await Promise.all([
    fetch(`${PSGC}/regions/`).then(r => r.json()).catch(() => []),
  ])
  regions.value      = Array.isArray(r)
    ? r.sort((a, b) => a.name.localeCompare(b.name))
    : []
})

// ── PSGC cascading watchers ──
watch(() => props.form.regionCode, async (code) => {
  provinces.value   = []
  cities.value      = []
  barangays.value   = []
  if (!code) return

  loadingProvinces.value = true
  try {
    if (code === '130000000') {
      const data = await fetch(`${PSGC}/regions/${code}/cities-municipalities/`).then(r => r.json())
      cities.value    = Array.isArray(data) ? data.sort((a,b) => a.name.localeCompare(b.name)) : []
      provinces.value = []
    } else {
      const data = await fetch(`${PSGC}/regions/${code}/provinces/`).then(r => r.json())
      provinces.value = Array.isArray(data) ? data.sort((a,b) => a.name.localeCompare(b.name)) : []
    }
  } catch { provinces.value = [] }
  loadingProvinces.value = false
})

watch(() => props.form.provinceCode, async (code) => {
  cities.value      = []
  barangays.value   = []
  if (!code) return

  loadingCities.value = true
  try {
    const data = await fetch(`${PSGC}/provinces/${code}/cities-municipalities/`).then(r => r.json())
    cities.value = Array.isArray(data) ? data.sort((a,b) => a.name.localeCompare(b.name)) : []
  } catch { cities.value = [] }
  loadingCities.value = false
})

watch(() => props.form.cityCode, async (code) => {
  barangays.value   = []
  if (!code) return

  loadingBarangays.value = true
  try {
    const data = await fetch(`${PSGC}/cities-municipalities/${code}/barangays/`).then(r => r.json())
    barangays.value = Array.isArray(data) ? data.sort((a,b) => a.name.localeCompare(b.name)) : []
  } catch { barangays.value = [] }
  loadingBarangays.value = false
})

// ── Computed address label for saving ──
const isNCR = computed(() => props.form.regionCode === '130000000')

const fullAddress = computed(() => {
  const region   = regions.value.find(r => r.code === props.form.regionCode)?.name    || ''
  const province = provinces.value.find(p => p.code === props.form.provinceCode)?.name || ''
  const city     = cities.value.find(c => c.code === props.form.cityCode)?.name        || ''
  const barangay = barangays.value.find(b => b.code === props.form.barangayCode)?.name || ''
  return [barangay, city, province, region].filter(Boolean).join(', ')
})

defineExpose({ fullAddress })

</script>

<template>
    <!-- ── Address via PSGC ── -->
    <div class="space-y-2">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Home Address</p>

        <!-- Region -->
        <div class="flex-1">
            <div v-if="loadingRegions" class="w-full h-11 rounded-lg bg-gray-100 animate-pulse"></div>
            <select v-else v-model="form.regionCode" @change="() => { form.provinceCode = '';  form.cityCode = ''; form.barangayCode = '' }"
                class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                :class="errors.regionCode ? 'border-red-400' : 'border-gray-300'">
                <option selected disabled value="">Region</option>
                <option v-for="r in regions" :key="r.code" :value="r.code">{{ r.name }}</option>
            </select>
            <p v-if="errors.regionCode" class="text-red-500 text-xs mt-1">{{ errors.regionCode }}</p>
        </div>

        <!-- Province (hidden for NCR) -->
        <div v-if="!isNCR && form.regionCode">
            <div v-if="loadingProvinces" class="w-full h-11 rounded-lg bg-gray-100 animate-pulse"></div>
            <select v-else v-model="form.provinceCode" @change="() => form.cityCode = ''" :disabled="!form.regionCode"
                class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                :class="errors.provinceCode ? 'border-red-400' : 'border-gray-300'">
                <option selected disabled value="">Province</option>
                <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
            </select>
            <p v-if="errors.provinceCode" class="text-red-500 text-xs mt-1">{{ errors.provinceCode }}</p>
        </div>

        <!-- City / Municipality -->
        <div v-if="isNCR || form.provinceCode">
            <div v-if="loadingCities" class="w-full h-11 rounded-lg bg-gray-100 animate-pulse"></div>
            <select v-else v-model="form.cityCode" @change="() => form.barangayCode = ''"
                :disabled="!isNCR && !form.provinceCode"
                class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                :class="errors.cityCode ? 'border-red-400' : 'border-gray-300'">
                <option selected disabled value="">City / Municipality</option>
                <option v-for="c in cities" :key="c.code" :value="c.code">{{ c.name }}</option>
            </select>
            <p v-if="errors.cityCode" class="text-red-500 text-xs mt-1">{{ errors.cityCode }}</p>
        </div>

        <!-- Barangay -->
        <div v-if="form.cityCode">
            <div v-if="loadingBarangays" class="w-full h-11 rounded-lg bg-gray-100 animate-pulse"></div>
            <select v-else v-model="form.barangayCode" :disabled="!form.cityCode"
                class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                :class="errors.barangayCode ? 'border-red-400' : 'border-gray-300'">
                <option selected disabled value="">Barangay</option>
                <option v-for="b in barangays" :key="b.code" :value="b.code">{{ b.name }}</option>
            </select>
            <p v-if="errors.barangayCode" class="text-red-500 text-xs mt-1">{{ errors.barangayCode }}</p>
        </div>

        <!-- Computed address preview -->
        <div v-if="fullAddress" class="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
                class="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5">
                <path d="M10 2C6.686 2 4 4.686 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.314-2.686-6-6-6z" />
                <circle cx="10" cy="8" r="2" />
            </svg>
            <p class="text-xs text-green-800 font-medium leading-relaxed">{{ fullAddress }}</p>
        </div>
    </div>
</template>