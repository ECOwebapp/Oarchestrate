<script setup>
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { onMounted, reactive, ref, computed } from 'vue'
import Icons from '@/components/Icons.vue'
import { usePosStore } from '@/stores/positions'
import { useUnitStore } from '@/stores/unit'
import PersonalInformation from '@/components/Profile/PersonalInformation.vue'
import ContactInformation from '@/components/Profile/ContactInformation.vue'
import WorkInformation from '@/components/Profile/WorkInformation.vue'
import { useAddressStore } from '@/stores/address'
import { useGenderStore } from '@/stores/gender'

const auth = useAuthStore()

// ── State ──
const loading = ref(true)

const loadingDropdowns = ref(true)
const units = useUnitStore()
const addressStore = useAddressStore()
const genders = useGenderStore()

const infoSection = ref('personal')

const form = reactive({
  fname: '',
  middle_initial: '',
  lname: '',
  birthdate: '',
  genderId: '',
  phone: '',
  address: '',
})

onMounted(async () => {
  loading.value = true
  try {
    // Run everything at once and wait for all to finish
    await Promise.all([
      units.fetchUnit(),
      genders.fetchGender(),
      addressStore.fetchUserAddress(auth.userID)
    ])
  } finally {
    loadingDropdowns.value = false
    loading.value = false
  }
})



// // ── Save ──
// const handleSave = async () => {
//   saving.value = true
//   saveSuccess.value = false
//   saveError.value = ''
//   uploadError.value = ''

//   const userId = auth.user?.id
//   if (!userId) { saving.value = false; return }

//   console.log('[save] Starting save for user:', userId)
//   console.log('[save] imageFile staged?', !!imageFile.value)

//   try {
//     const avatarUrl = await uploadAvatar(userId)

//     const profilePayload = {
//       fname: form.fname.trim(),
//       lname: form.lname.trim(),
//       middle_initial: form.middle_initial.trim() || null,
//       birthdate: form.birthdate || null,
//       gender_id: form.genderId ? parseInt(form.genderId) : null,
//     }

//     if (avatarUrl) {
//       profilePayload.avatar_url = avatarUrl
//       console.log('[save] avatar_url will be saved:', avatarUrl)
//     }

//     const [profRes, contactRes, addressRes] = await Promise.all([
//       supabase.from('user_profile').update(profilePayload).eq('user_id', userId),
//       supabase.from('contact').upsert({ user_id: userId, phone: form.phone.trim() }),
//       supabase.from('address').upsert({ user_id: userId, address: form.address.trim() }),
//     ])

//     if (profRes.error) throw profRes.error
//     if (contactRes.error) throw contactRes.error
//     if (addressRes.error) throw addressRes.error

//     // ── force=true so the navbar avatar refreshes immediately ──
//     await auth.fetchUserData(auth.user, true)

//     imageFile.value = null  // clear staged file after successful save
//     saveSuccess.value = true
//     setTimeout(() => saveSuccess.value = false, 3000)
//   } catch (err) {
//     console.error('[save] Error:', err)
//     saveError.value = err.message || 'Something went wrong.'
//   } finally {
//     saving.value = false
//   }
// }
</script>

<template>
  <div class="relative flex h-full min-h-0 justify-center overflow-y-auto bg-slate-100 px-3 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">

    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(6,95,70,0.1),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(20,83,45,0.08),_transparent_45%)]"></div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="relative z-10 flex w-full max-w-[1200px] gap-6 items-start animate-pulse">
      <div class="flex-1 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 space-y-5">
        <div class="flex gap-4">
          <div class="flex-1 h-10 rounded-lg bg-gray-200"></div>
          <div class="flex-1 h-10 rounded-lg bg-gray-200"></div>
          <div class="w-20 h-10 rounded-lg bg-gray-200"></div>
        </div>
        <div class="flex gap-4">
          <div class="flex-1 h-10 rounded-lg bg-gray-200"></div>
          <div class="w-52 h-10 rounded-lg bg-gray-200"></div>
        </div>
        <div class="flex gap-4">
          <div class="w-44 h-10 rounded-lg bg-gray-200"></div>
          <div class="flex-1 h-10 rounded-lg bg-gray-200"></div>
          <div class="w-44 h-10 rounded-lg bg-gray-200"></div>
        </div>
        <div class="h-36 rounded-lg bg-gray-200"></div>
      </div>
    </div>

    <!-- Main content -->
    <div v-else class="relative z-10 flex w-full max-w-[1220px] flex-col gap-5 overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-6 lg:min-h-0 lg:flex-row lg:p-8">

      <!-- Navbar -->
      <div class="w-full lg:w-72 lg:flex-shrink-0">
        <div class="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-900">
          <p class="font-bold tracking-wide uppercase">Profile Workspace</p>
          <p class="mt-1 text-emerald-800">Manage personal, contact, and work details in one place.</p>
        </div>
        <ul class="flex w-full flex-col gap-2 border-b border-slate-200 pb-4 lg:border-b-0 lg:border-r lg:pr-5 lg:pb-0">
          <li class="flex items-center p-4 block text-sm font-semibold rounded-2xl transition-colors hover:cursor-pointer"
            :class="infoSection === list.toLowerCase() ? 'bg-green-950 text-white shadow-sm' : 'text-slate-800 hover:bg-slate-100'"
            v-for="list in ['Personal', 'Contact', 'Work']" @click="infoSection = list.toLowerCase()">
            <Icons :icon="list.toLocaleLowerCase()" />
            <span class="flex-1 px-2">{{ list }} Information</span>
            <Icons :icon="'chevronRight'" />
          </li>
        </ul>
      </div>

      <div class="min-w-0 flex-1 overflow-x-hidden">
        <!-- Feedback banners -->
        <Transition name="fade">
          <div v-if="saveSuccess"
            class="mb-5 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 flex-shrink-0">
              <path d="M4 10l4 4 8-8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Profile saved successfully!
          </div>
        </Transition>
        <Transition name="fade">
          <div v-if="saveError" class="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {{ saveError }}
          </div>
        </Transition>

        <!-- Left: Avatar + Upload -->
        <PersonalInformation v-if="infoSection === 'personal'" />

        <!-- Contact Number, Email, Gender -->
        <ContactInformation v-else-if="infoSection === 'contact'" />

        <!-- Unit -->
        <WorkInformation v-else-if="infoSection === 'work'" :loading-dropdowns="loadingDropdowns" />
      </div>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>