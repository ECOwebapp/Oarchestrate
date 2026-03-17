<script setup>
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { onMounted, reactive, ref, computed } from 'vue'
import Icons from '@/components/Icons.vue'
import { usePosStore } from '@/stores/positions'
import { useUnitStore } from '@/stores/unit'
import { storeToRefs } from 'pinia'
import PersonalInformation from '@/components/Profile/PersonalInformation.vue'
import ContactInformation from '@/components/Profile/ContactInformation.vue'
import WorkInformation from '@/components/Profile/WorkInformation.vue'

const auth = useAuthStore()

// ── State ──
const loading = ref(true)
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')
const uploadError = ref('')   // separate error just for avatar
const imagePreview = ref(null)
const imageFile = ref(null)  // holds the actual File object
const fileInput = ref(null)
const genders = ref([])
const loadingDropdowns = ref(true)
const positions = usePosStore()
const units = useUnitStore()

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
      loadGenders(),
      units.fetchUnit(),
      loadProfileData()
    ])
  } finally {
    loadingDropdowns.value = false
    loading.value = false
  }
})

// ── Load dropdowns ──
const loadGenders = async () => {
  const { data, error } = await supabase.from('gender_type').select('id, gender').order('id')
  if (!error) genders.value = data
}

const loadProfileData = async () => {
  loading.value = true
  const userId = auth.user?.id
  if (!userId) { loading.value = false; return }

  const [profRes, contactRes, addressRes] = await Promise.all([
    supabase.from('user_profile')
      .select('fname, lname, middle_initial, birthdate, gender_id, avatar_url')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase.from('contact')
      .select('phone')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase.from('address')
      .select('address')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  if (profRes.error) console.error('[profile] user_profile:', profRes.error.message)

  if (profRes.data) {
    form.fname = profRes.data.fname || ''
    form.middle_initial = profRes.data.middle_initial || ''
    form.lname = profRes.data.lname || ''
    form.birthdate = profRes.data.birthdate || ''
    form.genderId = profRes.data.gender_id || ''
    if (profRes.data.avatar_url) {
      const base = profRes.data.avatar_url.split('?')[0]
      imagePreview.value = `${base}?t=${Date.now()}`
    }
  }

  if (contactRes.data) form.phone = contactRes.data.phone || ''
  if (addressRes.data) form.address = addressRes.data.address || ''

  loading.value = false
}

// ── Image selection (only previews — does NOT upload yet) ──
const handleImageUpload = (e) => {
  uploadError.value = ''
  const file = e.target.files[0]
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    uploadError.value = 'Invalid file type. Only JPG, PNG, WEBP allowed.'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    uploadError.value = 'File must be under 2 MB.'
    return
  }

  // Store the file — this is what gets uploaded on Save
  imageFile.value = file
  console.log('[avatar] File staged for upload:', file.name, file.type, file.size)

  const reader = new FileReader()
  reader.onload = (ev) => { imagePreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

const triggerUpload = () => fileInput.value?.fileInput.click()

// ── Upload avatar to Supabase Storage ──
const uploadAvatar = async (userId) => {
  if (!imageFile.value) {
    console.log('[avatar] No new image staged, skipping upload.')
    return null
  }

  console.log('[avatar] Starting upload for user:', userId)

  const ext = imageFile.value.name.split('.').pop().toLowerCase()
  const filePath = `${userId}/avatar.${ext}`

  console.log('[avatar] Uploading to path:', filePath)

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, imageFile.value, {
      upsert: true,
      contentType: imageFile.value.type,
    })

  if (error) {
    console.error('[avatar] Upload failed:', error.message, error)
    throw new Error(`Avatar upload failed: ${error.message}`)
  }

  console.log('[avatar] Upload success:', data)

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Add timestamp to bust browser cache (same filename = stale cache)
  const bustUrl = `${urlData.publicUrl}?t=${Date.now()}`
  console.log('[avatar] Public URL:', bustUrl)
  return bustUrl
}

// ── Save ──
const handleSave = async () => {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''
  uploadError.value = ''

  const userId = auth.user?.id
  if (!userId) { saving.value = false; return }

  console.log('[save] Starting save for user:', userId)
  console.log('[save] imageFile staged?', !!imageFile.value)

  try {
    const avatarUrl = await uploadAvatar(userId)

    const profilePayload = {
      fname: form.fname.trim(),
      lname: form.lname.trim(),
      middle_initial: form.middle_initial.trim() || null,
      birthdate: form.birthdate || null,
      gender_id: form.genderId ? parseInt(form.genderId) : null,
    }

    if (avatarUrl) {
      profilePayload.avatar_url = avatarUrl
      console.log('[save] avatar_url will be saved:', avatarUrl)
    }

    const [profRes, contactRes, addressRes] = await Promise.all([
      supabase.from('user_profile').update(profilePayload).eq('user_id', userId),
      supabase.from('contact').upsert({ user_id: userId, phone: form.phone.trim() }),
      supabase.from('address').upsert({ user_id: userId, address: form.address.trim() }),
    ])

    if (profRes.error) throw profRes.error
    if (contactRes.error) throw contactRes.error
    if (addressRes.error) throw addressRes.error

    // ── force=true so the navbar avatar refreshes immediately ──
    await auth.fetchUserData(auth.user, true)

    imageFile.value = null  // clear staged file after successful save
    saveSuccess.value = true
    setTimeout(() => saveSuccess.value = false, 3000)
  } catch (err) {
    console.error('[save] Error:', err)
    saveError.value = err.message || 'Something went wrong.'
  } finally {
    saving.value = false
  }
}
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
            <span class="flex-1 px-2">{{list}} Information</span>
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
        <PersonalInformation
          v-if="infoSection === 'personal'"
          :image-preview="imagePreview"
          :image-file="imageFile"
          :handle-image-upload="handleImageUpload"
          :trigger-upload="triggerUpload"
          :file-input="fileInput"
          :upload-error="uploadError"
          :form="form"
          :genders="genders"
          ref="fileInput"
          />

        <!-- Contact Number, Email, Gender -->
        <ContactInformation v-else-if="infoSection === 'contact'" :form="form" :email="auth.email" />

        <!-- Unit -->
        <WorkInformation
          v-else-if="infoSection === 'work'"
          :loading-dropdowns="loadingDropdowns"
          />

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3" v-if="infoSection !== 'work'">
          <button @click="loadProfileData" :disabled="saving"
            class="px-6 py-2 rounded-full border-2 border-red-800 text-red-800 font-semibold text-sm hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50">
            Reset
          </button>
          <button @click="handleSave" :disabled="saving"
            class="px-6 py-2 rounded-full bg-green-900 text-white font-semibold text-sm hover:bg-green-800 transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2">
            <svg v-if="saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round" />
            </svg>
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
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