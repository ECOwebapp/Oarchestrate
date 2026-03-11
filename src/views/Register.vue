<script setup>
import { supabase } from '@/lib/supabaseClient';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useUnitStore } from '@/stores/unit';

const router = useRouter()
const unit = useUnitStore()

const form = reactive({
  firstName:       '',
  middleInitial:   '',
  lastName:        '',
  idNumber:        '',
  phone:           '',
  regionCode:      '',
  provinceCode:    '',
  cityCode:        '',
  barangayCode:    '',
  unitId:          '',
  positionId:      '',
  birthdate:       '',
  genderId:        '',
  password:        '',
  confirmPassword: '',
})

// ── Dropdown data ──
const units            = ref([])
const filteredPositions = ref([])
const allPositions     = ref([])   // full list from DB
const genders          = ref([])
const loadingDropdowns = ref(true)

// ── PSGC data ──
const regions   = ref([])
const provinces = ref([])
const cities    = ref([])
const barangays = ref([])

const loadingRegions   = ref(false)
const loadingProvinces = ref(false)
const loadingCities    = ref(false)
const loadingBarangays = ref(false)

// ── UI ──
const loading      = ref(false)
const errors       = reactive({})
const showPassword = ref(false)
const showConfirm  = ref(false)
const step         = ref(1)
const showModal    = ref(false)

const PSGC = 'https://psgc.gitlab.io/api'

// ── Load static dropdowns + regions on mount ──
onMounted(async () => {
  loadingRegions.value = true
  const [u, p, g, r] = await Promise.all([
    supabase.from('unit_name').select('id, name').order('name'),
    supabase.from('position_name').select('id, pos_name:pos_id(pos_name), unit_id').order('pos_name'),
    supabase.from('gender_type').select('id, gender').order('id'),
    fetch(`${PSGC}/regions/`).then(r => r.json()).catch(() => []),
  ])
  units.value        = u.data || []
  allPositions.value = p.data || []
  genders.value      = g.data || []
  regions.value      = Array.isArray(r)
    ? r.sort((a, b) => a.name.localeCompare(b.name))
    : []
  loadingDropdowns.value = false
  loadingRegions.value   = false
})

// ── Positions filtered by selected unit ──
watch(() => form.unitId, async (newUnitId) => {
  if (!newUnitId) {
    filteredPositions.value = [];
    return;
  }
  
  // Call your store action
  await unit.fetchUnitPeers(newUnitId);
  
  // Assign the results to your local ref
  filteredPositions.value = unit.unit; 
}, { immediate: true }); // 'immediate' runs it once on startup too

// ── Reset positionId when unit changes ──
watch(() => form.unitId, () => {
  form.positionId = ''
  delete errors.positionId
})

// ── PSGC cascading watchers ──
watch(() => form.regionCode, async (code) => {
  form.provinceCode = ''
  form.cityCode     = ''
  form.barangayCode = ''
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

watch(() => form.provinceCode, async (code) => {
  form.cityCode     = ''
  form.barangayCode = ''
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

watch(() => form.cityCode, async (code) => {
  form.barangayCode = ''
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
const isNCR = computed(() => form.regionCode === '130000000')

const fullAddress = computed(() => {
  const region   = regions.value.find(r => r.code === form.regionCode)?.name    || ''
  const province = provinces.value.find(p => p.code === form.provinceCode)?.name || ''
  const city     = cities.value.find(c => c.code === form.cityCode)?.name        || ''
  const barangay = barangays.value.find(b => b.code === form.barangayCode)?.name || ''
  return [barangay, city, province, region].filter(Boolean).join(', ')
})

// ── Selected unit name helper ──
const selectedUnitName = computed(() =>
  units.value.find(u => u.id === parseInt(form.unitId))?.name || ''
)

// ── Validation ──
const clearError = (field) => { delete errors[field] }

const validateStep1 = () => {
  const e = {}
  if (!form.firstName.trim()) e.firstName  = 'Required'
  if (!form.lastName.trim())  e.lastName   = 'Required'
  if (!form.idNumber.trim())  e.idNumber   = 'Required'
  else if (!/^[A-Za-z0-9\-]+$/.test(form.idNumber.trim())) e.idNumber = 'Letters, numbers and hyphens only'
  if (!form.genderId)         e.genderId   = 'Required'
  if (!form.birthdate)        e.birthdate  = 'Required'
  if (!form.unitId)           e.unitId     = 'Required'
  if (!form.positionId)       e.positionId = 'Required'
  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(errors, e)
  return Object.keys(e).length === 0
}

const validateStep2 = () => {
  const e = {}
  if (!form.phone.trim())
    e.phone = 'Required'
  else if (!/^[0-9+\-\s()]{7,}$/.test(form.phone))
    e.phone = 'Invalid phone number'
  if (!form.regionCode)                         e.regionCode   = 'Required'
  if (!isNCR.value && !form.provinceCode)        e.provinceCode = 'Required'
  if (!form.cityCode)                            e.cityCode     = 'Required'
  if (!form.barangayCode)                        e.barangayCode = 'Required'
  if (!form.password)
    e.password = 'Required'
  else if (form.password.length < 8)
    e.password = 'Min. 8 characters'
  else if (!/[A-Z]/.test(form.password))
    e.password = 'Must include an uppercase letter'
  else if (!/[0-9]/.test(form.password))
    e.password = 'Must include a number'
  if (form.password !== form.confirmPassword)
    e.confirmPassword = 'Passwords do not match'
  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(errors, e)
  return Object.keys(e).length === 0
}

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return { label: '', pct: 0, color: '#e5e7eb' }
  let s = 0
  if (p.length >= 8)            s++
  if (p.length >= 12)           s++
  if (/[A-Z]/.test(p))          s++
  if (/[0-9]/.test(p))          s++
  if (/[^A-Za-z0-9]/.test(p))  s++
  if (s <= 2) return { label: 'Weak',   pct: 33,  color: '#ef4444' }
  if (s <= 3) return { label: 'Fair',   pct: 66,  color: '#ca8a04' }
  return             { label: 'Strong', pct: 100, color: '#15803d' }
})

const nextStep = () => { if (validateStep1()) step.value = 2 }
const prevStep = () => {
  Object.keys(errors).forEach(k => delete errors[k])
  step.value = 1
}

// ── Drop-in replacement for handleRegister in Register.vue ──
const handleRegister = async () => {
  if (!validateStep2()) return
  loading.value = true
  errors.general = undefined

  try {
    const internalEmail = `${form.idNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}@carsu.edu.ph`

    // 1. Create auth user
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email:    internalEmail,
      password: form.password,
    })
    if (authErr) throw authErr

    const userId = authData.user?.id
    if (!userId) throw new Error('No user ID returned.')

    // 2. UPSERT user_profile first — must exist before member_type FK resolves
    const { error: profErr } = await supabase
      .from('user_profile')
      .upsert({
        user_id:        userId,          // ✅ PK is user_id
        fname:          form.firstName.trim(),
        lname:          form.lastName.trim(),
        middle_initial: form.middleInitial.trim() || null,
        birthdate:      form.birthdate   || null,
        gender_id:      form.genderId    ? parseInt(form.genderId) : null,
        id_number:      form.idNumber.trim(),
      })
    if (profErr) throw new Error(`Profile error: ${profErr.message}`)

    // 3. Now insert everything else in parallel — user_profile row exists so FKs resolve
    const [
      contactRes,
      addressRes,
      positionRes,
      statusRes,
    ] = await Promise.all([
      supabase.from('contact').upsert({
        user_id: userId,
        phone:   form.phone.trim(),
      }),

      supabase.from('address').upsert({
        user_id:       userId,
        address:       fullAddress.value,
        region_code:   form.regionCode    || null,
        province_code: form.provinceCode  || null,
        city_code:     form.cityCode      || null,
        barangay_code: form.barangayCode  || null,
      }),

      supabase.from('position').upsert({
        user_id: userId,
        pos_id:  parseInt(form.positionId),
        unit_id: parseInt(form.unitId)
      }),

      // supabase.from('member_type').upsert({
      //   user_id: userId,
      //   role_id: (() => {
      //     const selectedPosition = allPositions.value.find(p => p.id === parseInt(form.positionId))
      //     const posName = selectedPosition?.pos_name?.toLowerCase() || ''
      //     if (posName.includes('unit head')) return 2
      //     if (posName.includes('director')) return 1
      //     return 3
      //   })(),
      // }),

      supabase.from('account_status').upsert({
        user_id:      userId,
        requested_at: new Date().toISOString(),
      }),
    ])

    // Surface any errors so they're not silently swallowed
    const errs = [
      contactRes.error  && `Contact: ${contactRes.error.message}`,
      addressRes.error  && `Address: ${addressRes.error.message}`,
      positionRes.error && `Position: ${positionRes.error.message}`,
      statusRes.error   && `Account status: ${statusRes.error.message}`,
    ].filter(Boolean)

    if (errs.length) {
      // Log all but only throw the first so the user sees a message
      errs.forEach(e => console.error('[Register]', e))
      throw new Error(errs[0])
    }

    showModal.value = true

  } catch (e) {
    console.error('Registration error:', e)
    if (e.message?.toLowerCase().includes('already registered')) {
      errors.idNumber = 'This ID Number is already registered.'
      step.value = 1
    } else {
      errors.general = e.message || 'Something went wrong. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const goToLogin = () => router.push('/login')
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden flex items-center justify-center">

    <!-- Background -->
    <div class="absolute inset-0 bg-[url('/images/csu_admin_building.png')] bg-cover bg-center"></div>
    <div class="absolute inset-0 backdrop-blur-sm bg-black/20"></div>

    <!-- Card -->
    <div class="relative z-10 w-full max-w-md mx-4 bg-white/95 backdrop-blur rounded-2xl shadow-2xl px-10 py-8 my-6">

      <!-- Logo -->
      <div class="flex justify-center mb-4">
        <img src="../../public/images/csu_seal.png" class="w-24 h-24 object-contain drop-shadow" />
      </div>

      <!-- Title -->
      <h1 class="text-center text-3xl font-bold text-gray-800 tracking-wide mb-2"
        style="font-family: 'Georgia', serif; letter-spacing: 0.04em;">
        Create Account
      </h1>
      <p class="text-center text-xs text-gray-400 tracking-widest uppercase mb-6">
        Caraga State University · ECO
      </p>

      <!-- Step indicator -->
      <div class="flex items-center mb-6 px-2">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"
            :class="step === 1 ? 'bg-green-800 border-green-800 text-white' : 'bg-green-700 border-green-700 text-white'">
            <svg v-if="step > 1" viewBox="0 0 14 14" fill="none" class="w-3.5 h-3.5">
              <path d="M2.5 7l3 3 6-6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-else>1</span>
          </div>
          <span class="text-xs font-semibold uppercase tracking-wider"
            :class="step === 1 ? 'text-green-800' : 'text-green-700'">Personal Info</span>
        </div>
        <div class="flex-1 h-0.5 mx-3 transition-all duration-300"
          :class="step > 1 ? 'bg-green-700' : 'bg-gray-200'"></div>
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"
            :class="step === 2 ? 'bg-green-800 border-green-800 text-white' : 'border-gray-300 text-gray-400'">
            <span>2</span>
          </div>
          <span class="text-xs font-semibold uppercase tracking-wider"
            :class="step === 2 ? 'text-green-800' : 'text-gray-400'">Account Setup</span>
        </div>
      </div>

      <!-- General error -->
      <div v-if="errors.general"
        class="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
        {{ errors.general }}
      </div>

      <!-- ── STEP 1: Personal Info ── -->
      <div v-show="step === 1" class="space-y-4">

        <!-- Name row -->
        <div class="flex gap-2">
          <div class="flex-1">
            <input v-model="form.firstName" type="text" placeholder="First Name"
              @input="clearError('firstName')"
              class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              :class="errors.firstName ? 'border-red-400' : 'border-gray-300'" />
            <p v-if="errors.firstName" class="text-red-500 text-xs mt-1">{{ errors.firstName }}</p>
          </div>
          <div class="w-16">
            <input v-model="form.middleInitial" type="text" placeholder="M.I." maxlength="3"
              class="w-full px-3 py-3 rounded-lg border border-gray-300 text-gray-700 bg-white text-sm placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent" />
          </div>
          <div class="flex-1">
            <input v-model="form.lastName" type="text" placeholder="Last Name"
              @input="clearError('lastName')"
              class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              :class="errors.lastName ? 'border-red-400' : 'border-gray-300'" />
            <p v-if="errors.lastName" class="text-red-500 text-xs mt-1">{{ errors.lastName }}</p>
          </div>
        </div>

        <!-- ID Number -->
        <div>
          <input v-model="form.idNumber" type="text" placeholder="ID Number (e.g. CSU-2024-00123)"
            @input="clearError('idNumber')"
            class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
            :class="errors.idNumber ? 'border-red-400' : 'border-gray-300'" />
          <p v-if="errors.idNumber" class="text-red-500 text-xs mt-1">{{ errors.idNumber }}</p>
          <p class="text-gray-400 text-xs mt-1">This will be used as your login credential.</p>
        </div>

        <!-- Gender + Birthdate -->
        <div class="flex gap-2">
          <div class="flex-1">
            <select v-model="form.genderId" @change="clearError('genderId')"
              class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              :class="errors.genderId ? 'border-red-400' : 'border-gray-300'">
              <option disabled value="">Gender</option>
              <option v-for="g in genders" :key="g.id" :value="g.id">{{ g.gender }}</option>
            </select>
            <p v-if="errors.genderId" class="text-red-500 text-xs mt-1">{{ errors.genderId }}</p>
          </div>
          <div class="flex-1">
            <input v-model="form.birthdate" type="date" @change="clearError('birthdate')"
              class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              :class="errors.birthdate ? 'border-red-400' : 'border-gray-300'" />
            <p v-if="errors.birthdate" class="text-red-500 text-xs mt-1">{{ errors.birthdate }}</p>
          </div>
        </div>

        <!-- ── Unit + Position (grouped) ── -->
        <div class="rounded-xl border border-gray-200 overflow-hidden">

          <!-- Unit -->
          <div class="px-4 pt-3 pb-3 bg-gray-50 border-b border-gray-200">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Unit</p>
            <div v-if="loadingDropdowns" class="w-full h-10 rounded-lg bg-gray-200 animate-pulse"></div>
            <select v-else v-model="form.unitId" @change="clearError('unitId')"
              class="w-full px-3 py-2.5 rounded-lg border bg-white text-gray-700 text-sm transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              :class="errors.unitId ? 'border-red-400' : 'border-gray-300'">
              <option disabled value="">Select your unit</option>
              <option v-for="u in units" :key="u.id" :value="u.id">{{ u.name }}</option>
            </select>
            <p v-if="errors.unitId" class="text-red-500 text-xs mt-1">{{ errors.unitId }}</p>
          </div>

          <!-- Position — shown always, disabled until unit is selected -->
          <div class="px-4 pt-3 pb-3 bg-white">
            <p class="text-xs font-semibold uppercase tracking-wider mb-2 transition-colors"
              :class="form.unitId ? 'text-gray-400' : 'text-gray-300'">
              Position
              <span v-if="selectedUnitName" class="normal-case font-normal text-green-700 ml-1">
                — {{ selectedUnitName }}
              </span>
            </p>

            <div v-if="loadingDropdowns" class="w-full h-10 rounded-lg bg-gray-200 animate-pulse"></div>
            <template v-else>
              <!-- No unit selected yet -->
              <div v-if="!form.unitId"
                class="w-full px-3 py-2.5 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-sm flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4 flex-shrink-0">
                  <path d="M10 2C6.686 2 4 4.686 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.314-2.686-6-6-6z" stroke-dasharray="2 2"/>
                </svg>
                Select a unit first
              </div>

              <!-- No positions found for this unit -->
              <div v-else-if="filteredPositions.length === 0"
                class="w-full px-3 py-2.5 rounded-lg border border-dashed border-amber-300 bg-amber-50 text-amber-600 text-sm">
                No positions found for this unit.
              </div>

              <!-- Position dropdown -->
              <select v-else v-model="form.positionId" @change="clearError('positionId')"
                class="w-full px-3 py-2.5 rounded-lg border bg-white text-gray-700 text-sm transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                :class="errors.positionId ? 'border-red-400' : 'border-gray-300'">
                <option disabled value="">Select your position</option>
                <option v-for="p in filteredPositions" :key="p.pos_id" :value="p.pos_id">
                  {{ p.pos_name }}
                </option>
              </select>
            </template>

            <p v-if="errors.positionId" class="text-red-500 text-xs mt-1">{{ errors.positionId }}</p>
          </div>

        </div>

        <button type="button" @click="nextStep"
          class="w-full py-3 rounded-lg bg-green-800 hover:bg-green-900 active:scale-95 text-white font-semibold tracking-wide shadow-md transition-all duration-150 text-sm flex items-center justify-center gap-2">
          Continue
          <svg viewBox="0 0 20 20" fill="none" class="w-4 h-4">
            <path d="M4 10h12M11 5l5 5-5 5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <p class="text-center text-sm text-gray-500">
          Already have an account?
          <RouterLink to="/login" class="text-green-800 font-semibold hover:underline">Sign in.</RouterLink>
        </p>
      </div>

      <!-- ── STEP 2: Account Setup ── -->
      <div v-show="step === 2" class="space-y-4">

        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</p>
        <!-- Phone -->
        <div>
          <input v-model="form.phone" type="tel" placeholder="Phone Number"
            @input="clearError('phone')"
            class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
            :class="errors.phone ? 'border-red-400' : 'border-gray-300'" />
          <p v-if="errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
        </div>

        <!-- ── Address via PSGC ── -->
        <div class="space-y-2">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Home Address</p>

          <!-- Region -->
          <div>
            <div v-if="loadingRegions" class="w-full h-11 rounded-lg bg-gray-100 animate-pulse"></div>
            <select v-else v-model="form.regionCode" @change="clearError('regionCode')"
              class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              :class="errors.regionCode ? 'border-red-400' : 'border-gray-300'">
              <option disabled value="">Region</option>
              <option v-for="r in regions" :key="r.code" :value="r.code">{{ r.name }}</option>
            </select>
            <p v-if="errors.regionCode" class="text-red-500 text-xs mt-1">{{ errors.regionCode }}</p>
          </div>

          <!-- Province (hidden for NCR) -->
          <div v-if="form.regionCode && !isNCR">
            <div v-if="loadingProvinces" class="w-full h-11 rounded-lg bg-gray-100 animate-pulse"></div>
            <select v-else v-model="form.provinceCode" @change="clearError('provinceCode')"
              :disabled="!form.regionCode"
              class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              :class="errors.provinceCode ? 'border-red-400' : 'border-gray-300'">
              <option disabled value="">Province</option>
              <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
            </select>
            <p v-if="errors.provinceCode" class="text-red-500 text-xs mt-1">{{ errors.provinceCode }}</p>
          </div>

          <!-- City / Municipality -->
          <div v-if="isNCR || form.provinceCode">
            <div v-if="loadingCities" class="w-full h-11 rounded-lg bg-gray-100 animate-pulse"></div>
            <select v-else v-model="form.cityCode" @change="clearError('cityCode')"
              :disabled="!isNCR && !form.provinceCode"
              class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              :class="errors.cityCode ? 'border-red-400' : 'border-gray-300'">
              <option disabled value="">City / Municipality</option>
              <option v-for="c in cities" :key="c.code" :value="c.code">{{ c.name }}</option>
            </select>
            <p v-if="errors.cityCode" class="text-red-500 text-xs mt-1">{{ errors.cityCode }}</p>
          </div>

          <!-- Barangay -->
          <div v-if="form.cityCode">
            <div v-if="loadingBarangays" class="w-full h-11 rounded-lg bg-gray-100 animate-pulse"></div>
            <select v-else v-model="form.barangayCode" @change="clearError('barangayCode')"
              :disabled="!form.cityCode"
              class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white text-sm transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              :class="errors.barangayCode ? 'border-red-400' : 'border-gray-300'">
              <option disabled value="">Barangay</option>
              <option v-for="b in barangays" :key="b.code" :value="b.code">{{ b.name }}</option>
            </select>
            <p v-if="errors.barangayCode" class="text-red-500 text-xs mt-1">{{ errors.barangayCode }}</p>
          </div>

          <!-- Computed address preview -->
          <div v-if="fullAddress"
            class="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"
              class="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5">
              <path d="M10 2C6.686 2 4 4.686 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.314-2.686-6-6-6z"/>
              <circle cx="10" cy="8" r="2"/>
            </svg>
            <p class="text-xs text-green-800 font-medium leading-relaxed">{{ fullAddress }}</p>
          </div>
        </div>

        <!-- Password -->
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</p>
          <div class="relative">
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'"
              placeholder="Password" @input="clearError('password')"
              class="w-full px-4 py-3 pr-11 rounded-lg border text-gray-700 bg-white text-sm placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              :class="errors.password ? 'border-red-400' : 'border-gray-300'" />
            <button type="button" @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <div v-if="form.password" class="flex items-center gap-2 mt-1.5">
            <div class="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-300"
                :style="{ width: passwordStrength.pct + '%', background: passwordStrength.color }"></div>
            </div>
            <span class="text-xs font-semibold" :style="{ color: passwordStrength.color }">
              {{ passwordStrength.label }}
            </span>
          </div>
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>

        <!-- Confirm Password -->
        <div>
          <div class="relative">
            <input v-model="form.confirmPassword" :type="showConfirm ? 'text' : 'password'"
              placeholder="Confirm Password" @input="clearError('confirmPassword')"
              class="w-full px-4 py-3 pr-11 rounded-lg border text-gray-700 bg-white text-sm placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              :class="errors.confirmPassword ? 'border-red-400' : 'border-gray-300'" />
            <button type="button" @click="showConfirm = !showConfirm"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
              <svg v-if="!showConfirm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-5 h-5">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
        </div>

        <!-- Buttons -->
        <div class="flex gap-2">
          <button type="button" @click="prevStep"
            class="flex-none px-5 py-3 rounded-lg border-2 border-gray-300 text-gray-600 font-semibold text-sm hover:border-green-700 hover:text-green-700 transition-all duration-150 flex items-center gap-1.5">
            <svg viewBox="0 0 20 20" fill="none" class="w-4 h-4">
              <path d="M16 10H4M9 5l-5 5 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back
          </button>
          <button type="button" @click="handleRegister" :disabled="loading"
            class="flex-1 py-3 rounded-lg bg-green-800 hover:bg-green-900 active:scale-95 text-white font-semibold tracking-wide shadow-md transition-all duration-150 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
            <svg v-if="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
            <span>{{ loading ? 'Creating Account…' : 'Create Account' }}</span>
          </button>
        </div>

        <p class="text-center text-sm text-gray-500">
          Already have an account?
          <RouterLink to="/login" class="text-green-800 font-semibold hover:underline">Sign in.</RouterLink>
        </p>
      </div>

    </div>

    <!-- ── Success Modal ── -->
    <Transition name="modal">
      <div v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">

          <div class="w-20 h-20 mx-auto mb-5">
            <svg viewBox="0 0 80 80" fill="none" class="w-full h-full">
              <circle cx="40" cy="40" r="36" stroke="#15803d" stroke-width="3"
                stroke-dasharray="226" stroke-dashoffset="226"
                style="animation: drawCircle 0.6s ease forwards;"/>
              <path d="M24 40l10 10 22-22" stroke="#15803d" stroke-width="4"
                stroke-linecap="round" stroke-linejoin="round"
                stroke-dasharray="48" stroke-dashoffset="48"
                style="animation: drawCheck 0.4s ease 0.55s forwards;"/>
            </svg>
          </div>

          <h2 class="text-2xl font-bold text-gray-800 mb-2"
            style="font-family: 'Georgia', serif;">
            Registration Submitted!
          </h2>

          <div class="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Pending Director Approval
          </div>

          <p class="text-gray-500 text-sm leading-relaxed mb-5">
            Your account is now <span class="font-semibold text-gray-700">awaiting approval</span> from the Director.
            You will be notified once your registration has been reviewed.
          </p>

          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left space-y-2">
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4 text-green-700 flex-shrink-0">
                <circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5"/>
              </svg>
              Average review time: <span class="font-semibold text-gray-700">1–2 business days</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4 text-green-700 flex-shrink-0">
                <path d="M10 2C6.686 2 4 4.686 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.314-2.686-6-6-6z"/>
                <circle cx="10" cy="8" r="2"/>
              </svg>
              Address saved: <span class="font-semibold text-gray-700">{{ fullAddress }}</span>
            </div>
          </div>

          <button @click="goToLogin"
            class="w-full py-3 rounded-lg bg-green-800 hover:bg-green-900 active:scale-95 text-white font-semibold tracking-wide shadow-md transition-all duration-150 text-sm">
            Back to Sign In
          </button>

        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
input::placeholder { color: #9ca3af; }

@keyframes drawCircle { to { stroke-dashoffset: 0; } }
@keyframes drawCheck  { to { stroke-dashoffset: 0; } }

.modal-enter-active { animation: modalIn 0.3s cubic-bezier(.16,1,.3,1); }
.modal-leave-active { animation: modalOut 0.2s ease; }
@keyframes modalIn  { from { opacity: 0; transform: scale(0.93); } to { opacity: 1; transform: scale(1); } }
@keyframes modalOut { from { opacity: 1; } to { opacity: 0; transform: scale(0.95); } }
</style>