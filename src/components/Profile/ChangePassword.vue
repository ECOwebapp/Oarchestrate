<script setup vapor>
import { computed, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')
const verifyingCurrent = ref(false)
const oldPasswordVerified = ref(false)
const auth = useAuthStore()

const showCurrent = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)

const form = reactive({
  currentPassword: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  currentPassword: '',
  password: '',
  confirmPassword: '',
})

defineExpose({ saveSuccess, saveError })

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return { label: '', pct: 0, color: '#e5e7eb' }

  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++

  if (score <= 2) return { label: 'Weak', pct: 33, color: '#ef4444' }
  if (score <= 3) return { label: 'Fair', pct: 66, color: '#ca8a04' }
  return { label: 'Strong', pct: 100, color: '#15803d' }
})

function clearError(field) {
  errors[field] = ''
  saveError.value = ''
}

function resetForm() {
  form.currentPassword = ''
  form.password = ''
  form.confirmPassword = ''
  errors.currentPassword = ''
  errors.password = ''
  errors.confirmPassword = ''
  oldPasswordVerified.value = false
  saveError.value = ''
  saveSuccess.value = false
}

// Requires testing once internet connection returns
// >> Hexer <<
async function verifyCurrentPassword() {
  errors.currentPassword = ''
  saveError.value = ''

  if (!form.currentPassword) {
    errors.currentPassword = 'Required'
    return
  }

  verifyingCurrent.value = true
  try {
    const response = await auth.passManagement({ password: form.currentPassword }, 'verify')

    if (response.error) throw response.error

    oldPasswordVerified.value = true
  } catch {
    errors.currentPassword = 'Current password is incorrect'
    oldPasswordVerified.value = false
  } finally {
    verifyingCurrent.value = false
  }
}

function validate() {
  errors.currentPassword = ''
  errors.password = ''
  errors.confirmPassword = ''

  if (!oldPasswordVerified.value) {
    errors.currentPassword = 'Verify current password first'
    return false
  }

  if (!form.password) {
    errors.password = 'Required'
  } else if (form.password.length < 8) {
    errors.password = 'Min. 8 characters'
  } else if (!/[A-Z]/.test(form.password)) {
    errors.password = 'Must include an uppercase letter'
  } else if (!/[0-9]/.test(form.password)) {
    errors.password = 'Must include a number'
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return !errors.password && !errors.confirmPassword
}

async function handleSave() {
  if (!validate()) return

  saving.value = true
  saveSuccess.value = false
  saveError.value = ''

  try {
    const response = await auth.passManagement({ password: form.password }, 'change')

    if (response.error) throw response.error

    saveSuccess.value = true
    form.password = ''
    form.confirmPassword = ''
  } catch (err) {
    saveError.value = err?.message || 'Unable to update password right now.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[380px] flex-col pt-2">
    <div class="mb-5 grid grid-cols-1 gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div class="min-w-0 lg:max-w-[520px]">
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Current Password</label>
        <div class="flex flex-col gap-3 sm:flex-row">
          <div class="relative min-w-0 flex-1">
            <input v-model="form.currentPassword" :type="showCurrent ? 'text' : 'password'"
              placeholder="Enter current password" @input="clearError('currentPassword')"
              class="w-full rounded-xl border p-3.5 pr-11 text-sm text-gray-700 placeholder-gray-400 shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition focus:outline-none focus:ring-2 focus:ring-emerald-100"
              :class="errors.currentPassword ? 'border-red-400' : 'border-slate-300 focus:border-emerald-600'"
              :disabled="oldPasswordVerified" />
            <button type="button" @click="showCurrent = !showCurrent"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
              :disabled="oldPasswordVerified">
              <svg v-if="!showCurrent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                class="h-5 w-5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>

          <button type="button" @click="verifyCurrentPassword" :disabled="verifyingCurrent || oldPasswordVerified"
            class="rounded-full bg-gradient-to-r from-emerald-800 to-green-700 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(4,120,87,0.25)] transition-all hover:-translate-y-0.5 hover:from-emerald-700 hover:to-green-600 hover:shadow-[0_10px_24px_rgba(4,120,87,0.32)] disabled:opacity-60">
            {{ verifyingCurrent ? 'Verifying...' : oldPasswordVerified ? 'Verified' : 'Verify' }}
          </button>
        </div>
        <p v-if="errors.currentPassword" class="mt-1 text-xs text-red-500">{{ errors.currentPassword }}</p>
      </div>

      <div v-if="oldPasswordVerified" class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div class="min-w-0">
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">New Password</label>
          <div class="relative">
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Enter new password"
              @input="clearError('password')"
              class="w-full rounded-xl border p-3.5 text-sm text-gray-700 placeholder-gray-400 shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition focus:outline-none focus:ring-2 focus:ring-emerald-100"
              :class="errors.password ? 'border-red-400' : 'border-slate-300 focus:border-emerald-600'" />
            <button type="button" @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600">
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                class="h-5 w-5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>

          <div v-if="form.password" class="mt-1.5 flex items-center gap-2">
            <div class="h-1 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div class="h-full rounded-full transition-all duration-300"
                :style="{ width: passwordStrength.pct + '%', background: passwordStrength.color }"></div>
            </div>
            <span class="text-xs font-semibold" :style="{ color: passwordStrength.color }">{{ passwordStrength.label
              }}</span>
          </div>
          <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
        </div>

        <div class="min-w-0">
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Confirm
            Password</label>
          <div class="relative">
            <input v-model="form.confirmPassword" :type="showConfirm ? 'text' : 'password'"
              placeholder="Confirm Password" @input="clearError('confirmPassword')"
              class="w-full rounded-xl border p-3.5 text-sm text-gray-700 placeholder-gray-400 shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition focus:outline-none focus:ring-2 focus:ring-emerald-100"
              :class="errors.confirmPassword ? 'border-red-400' : 'border-slate-300 focus:border-emerald-600'" />
            <button type="button" @click="showConfirm = !showConfirm"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600">
              <svg v-if="!showConfirm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                class="h-5 w-5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-5 w-5">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
          <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-500">{{ errors.confirmPassword }}</p>
        </div>
      </div>
    </div>

    <div class="mt-auto flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button @click="resetForm" :disabled="saving"
        class="w-full rounded-full border-2 border-red-800 px-6 py-2 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100 cursor-pointer disabled:opacity-50 sm:w-auto">
        Reset
      </button>
      <button @click="handleSave" :disabled="saving"
        class="flex w-full items-center justify-center gap-2 rounded-full bg-green-900 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-800 cursor-pointer disabled:opacity-60 sm:w-auto">
        <svg v-if="saving" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round" />
        </svg>
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </div>
  </div>
</template>
