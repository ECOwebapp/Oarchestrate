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
  <div class="flex justify-center h-full overflow-y-auto bg-gray-100 px-10 py-8">

    <!-- Loading skeleton -->
    <div v-if="loading" class="flex gap-8 items-start animate-pulse">
      <div class="flex-1 bg-white rounded-2xl shadow-sm p-8 space-y-5">
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
    <div v-else class="flex flex-row h-full w-[80%] gap-5 items-start bg-white rounded-2xl shadow-sm p-8">

      <!-- Navbar -->
      <div class="border-r border-gray-300 h-full">
        <ul class="flex flex-col pr-5">
          <li class="flex items-center p-4 block text-sm font-semibold text-black rounded-2xl hover:cursor-pointer"
            :class="infoSection === list.toLowerCase() ? 'bg-green-950 text-white' : 'hover:bg-gray-300/80'"
            v-for="list in ['Personal', 'Contact', 'Work']" @click="infoSection = list.toLowerCase()">
            <Icons :icon="list.toLocaleLowerCase()" />
            <span class="flex-1 px-2">{{ list }} Information</span>
            <Icons :icon="'chevronRight'" />
          </li>
        </ul>
      </div>

      <div class="flex-1">
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