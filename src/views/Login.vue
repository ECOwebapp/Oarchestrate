<script setup>
import { supabase } from '@/lib/supabaseClient';
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const router = useRouter()

const form = reactive({
  idNumber:   '',
  password:   '',
  rememberMe: true,
})

const loading      = ref(false)
const showPassword = ref(false)
const errors       = reactive({})
const showPending  = ref(false)
const showDenied   = ref(false)
const deniedReason = ref('')

const clearError = (field) => { delete errors[field] }

const validate = () => {
  const e = {}
  if (!form.idNumber.trim()) e.idNumber  = 'ID Number is required'
  if (!form.password)        e.password  = 'Password is required'
  Object.keys(errors).forEach(k => delete errors[k])
  Object.assign(errors, e)
  return Object.keys(e).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return
  loading.value = true

  try {
    // Reconstruct internal email from ID number (same formula used at registration)
    const internalEmail = `${form.idNumber.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}@carsu.edu.ph`

    // Sign in directly — no email lookup needed
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email:    internalEmail,
      password: form.password,
    })

    if (authErr) {
      if (authErr.message?.toLowerCase().includes('invalid')) {
        errors.password = 'Incorrect password.'
      } else {
        errors.general = authErr.message
      }
      loading.value = false
      return
    }

    const userId = authData.user?.id

    // 3. Check account_status
    const { data: statusData } = await supabase
      .from('account_status')
      .select('status, notes')
      .eq('user_id', userId)
      .single()

    const status = statusData?.status ?? 'pending'

    if (status === 'pending') {
      // Sign them back out — don't let them in yet
      await supabase.auth.signOut()
      showPending.value = true
      loading.value = false
      return
    }

    if (status === 'denied') {
      await supabase.auth.signOut()
      deniedReason.value = statusData?.notes || ''
      showDenied.value = true
      loading.value = false
      return
    }

    router.push('/dashboard')

  } catch (e) {
    console.error('Login error:', e)
    errors.general = 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden flex items-center justify-center">

    <!-- Background -->
    <div class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('../../public/images/csu_bg.jpg');"></div>
    <div class="absolute inset-0 backdrop-blur-sm bg-black/20"></div>

    <!-- Login card -->
    <div class="relative z-10 w-full max-w-md mx-4 bg-white/95 backdrop-blur rounded-2xl shadow-2xl px-10 py-10">

      <!-- Logo -->
      <div class="flex justify-center mb-5">
        <img src="../../public/images/csu_logo.png"
          class="w-32 h-32 object-contain drop-shadow" />
      </div>

      <!-- Title -->
      <h1 class="text-center text-3xl font-bold text-gray-800 tracking-wide mb-2"
        style="font-family: 'Georgia', serif; letter-spacing: 0.04em;">
        Oarchestrate
      </h1>
      <p class="text-center text-xs text-gray-400 tracking-widest uppercase mb-8">
        Caraga State University · ECO
      </p>

      <!-- General error -->
      <div v-if="errors.general"
        class="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
        {{ errors.general }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">

        <!-- ID Number -->
        <div>
          <input
            v-model="form.idNumber"
            type="text"
            placeholder="ID Number"
            @input="clearError('idNumber')"
            class="w-full px-4 py-3 rounded-lg border text-gray-700 bg-white transition placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
            :class="errors.idNumber ? 'border-red-400' : 'border-gray-300'"
          />
          <p v-if="errors.idNumber" class="text-red-500 text-xs mt-1">{{ errors.idNumber }}</p>
        </div>

        <!-- Password -->
        <div>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              @input="clearError('password')"
              class="w-full px-4 py-3 pr-11 rounded-lg border text-gray-700 bg-white transition placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
              :class="errors.password ? 'border-red-400' : 'border-gray-300'"
            />
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
          <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
        </div>

        <!-- Remember me -->
        <div class="flex items-center gap-2">
          <input id="remember" v-model="form.rememberMe" type="checkbox"
            class="w-4 h-4 rounded accent-green-700 cursor-pointer" />
          <label for="remember" class="text-sm text-gray-600 cursor-pointer select-none">
            Remember me
          </label>
        </div>

        <!-- Create account -->
        <p class="text-center text-sm text-gray-500">
          Don't have an account yet?
          <RouterLink to="/register" class="text-green-800 font-semibold hover:underline">
            Create account.
          </RouterLink>
        </p>

        <!-- Sign In button -->
        <button type="submit" :disabled="loading"
          class="w-full py-3 rounded-lg bg-green-800 hover:bg-green-900 active:scale-95 text-white font-semibold tracking-wide shadow-md transition-all duration-150 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
          <svg v-if="loading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <span>{{ loading ? 'Signing in…' : 'Sign In' }}</span>
        </button>

      </form>
    </div>

    <!-- ── Pending Approval Modal ── -->
    <Transition name="modal">
      <div v-if="showPending"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">

          <!-- Animated clock icon -->
          <div class="w-20 h-20 mx-auto mb-5">
            <svg viewBox="0 0 80 80" fill="none" class="w-full h-full">
              <circle cx="40" cy="40" r="36" stroke="#15803d" stroke-width="3"
                stroke-dasharray="226" stroke-dashoffset="226"
                style="animation: drawCircle 0.6s ease forwards;"/>
              <circle cx="40" cy="40" r="36" fill="#f0fdf4" style="animation: fadeFill 0.3s ease 0.3s both;"/>
              <path d="M40 24v18l10 6" stroke="#15803d" stroke-width="3.5"
                stroke-linecap="round" stroke-linejoin="round"
                stroke-dasharray="40" stroke-dashoffset="40"
                style="animation: drawCheck 0.4s ease 0.55s forwards;"/>
            </svg>
          </div>

          <h2 class="text-2xl font-bold text-gray-800 mb-2"
            style="font-family: 'Georgia', serif;">
            Account Pending
          </h2>

          <!-- Status badge -->
          <div class="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Awaiting Director Approval
          </div>

          <p class="text-gray-500 text-sm leading-relaxed mb-5">
            Your account is still <span class="font-semibold text-gray-700">under review</span> by the Director.
            You will be able to sign in once your registration has been approved.
          </p>

          <!-- Info box -->
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left space-y-2">
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4 text-green-700 flex-shrink-0">
                <circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5"/>
              </svg>
              Average review time: <span class="font-semibold text-gray-700">1–2 business days</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4 text-green-700 flex-shrink-0">
                <path d="M3 4h14v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z"/><path d="M3 4l7 8 7-8"/>
              </svg>
              Check your email inbox for updates
            </div>
          </div>

          <button @click="showPending = false"
            class="w-full py-3 rounded-lg bg-green-800 hover:bg-green-900 active:scale-95 text-white font-semibold tracking-wide shadow-md transition-all duration-150 text-sm">
            Got it
          </button>

        </div>
      </div>
    </Transition>

    <!-- ── Denied Modal ── -->
    <Transition name="modal">
      <div v-if="showDenied"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">

          <div class="w-20 h-20 mx-auto mb-5">
            <svg viewBox="0 0 80 80" fill="none" class="w-full h-full">
              <circle cx="40" cy="40" r="36" stroke="#dc2626" stroke-width="3"
                stroke-dasharray="226" stroke-dashoffset="226"
                style="animation: drawCircle 0.6s ease forwards;"/>
              <circle cx="40" cy="40" r="36" fill="#fff1f2" style="animation: fadeFill 0.3s ease 0.3s both;"/>
              <path d="M28 28l24 24M52 28L28 52" stroke="#dc2626" stroke-width="3.5"
                stroke-linecap="round"
                stroke-dasharray="40" stroke-dashoffset="40"
                style="animation: drawCheck 0.4s ease 0.55s forwards;"/>
            </svg>
          </div>

          <h2 class="text-2xl font-bold text-gray-800 mb-2"
            style="font-family: 'Georgia', serif;">
            Registration Denied
          </h2>

          <div class="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
            <span class="w-2 h-2 rounded-full bg-red-400"></span>
            Access Denied
          </div>

          <p class="text-gray-500 text-sm leading-relaxed mb-4">
            Your registration was <span class="font-semibold text-gray-700">not approved</span> by the Director.
          </p>

          <!-- Reason box (if provided) -->
          <div v-if="deniedReason"
            class="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-left">
            <p class="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Reason</p>
            <p class="text-sm text-gray-600">{{ deniedReason }}</p>
          </div>

          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4 text-gray-400 flex-shrink-0">
                <path d="M3 4h14v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4z"/><path d="M3 4l7 8 7-8"/>
              </svg>
              Contact your office admin for further assistance.
            </div>
          </div>

          <button @click="showDenied = false"
            class="w-full py-3 rounded-lg bg-green-800 hover:bg-green-900 active:scale-95 text-white font-semibold tracking-wide shadow-md transition-all duration-150 text-sm">
            Close
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
@keyframes fadeFill   { from { opacity: 0; } to { opacity: 1; } }

.modal-enter-active { animation: modalIn 0.3s cubic-bezier(.16,1,.3,1); }
.modal-leave-active { animation: modalOut 0.2s ease; }
@keyframes modalIn  { from { opacity: 0; transform: scale(0.93); } to { opacity: 1; transform: scale(1); } }
@keyframes modalOut { from { opacity: 1; } to { opacity: 0; transform: scale(0.95); } }
</style>