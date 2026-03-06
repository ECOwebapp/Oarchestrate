<script setup>
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { onMounted, reactive, ref } from 'vue'
import Icons from '@/components/Icons.vue'

const auth = useAuthStore()

// ── State ──
const loading        = ref(true)
const saving         = ref(false)
const saveSuccess    = ref(false)
const saveError      = ref('')
const uploadError    = ref('')   // separate error just for avatar
const imagePreview   = ref(null)
const imageFile      = ref(null)  // holds the actual File object
const fileInput      = ref(null)
const genders        = ref([])

const form = reactive({
  fname:          '',
  middle_initial: '',
  lname:          '',
  birthdate:      '',
  genderId:       '',
  phone:          '',
  address:        '',
})

// ── Load dropdowns ──
const loadGenders = async () => {
  const { data, error } = await supabase.from('gender_type').select('id, gender').order('id')
  if (!error) genders.value = data
}

// ── Load user data ──
onMounted(async () => {
  await loadGenders()
  await loadProfileData()
})

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
    form.fname          = profRes.data.fname          || ''
    form.middle_initial = profRes.data.middle_initial || ''
    form.lname          = profRes.data.lname          || ''
    form.birthdate      = profRes.data.birthdate      || ''
    form.genderId       = profRes.data.gender_id      || ''
    if (profRes.data.avatar_url) {
      const base = profRes.data.avatar_url.split('?')[0]
      imagePreview.value = `${base}?t=${Date.now()}`
    }
  }

  if (contactRes.data) form.phone   = contactRes.data.phone   || ''
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

const triggerUpload = () => fileInput.value?.click()

// ── Upload avatar to Supabase Storage ──
const uploadAvatar = async (userId) => {
  if (!imageFile.value) {
    console.log('[avatar] No new image staged, skipping upload.')
    return null
  }

  console.log('[avatar] Starting upload for user:', userId)

  const ext      = imageFile.value.name.split('.').pop().toLowerCase()
  const filePath = `${userId}/avatar.${ext}`

  console.log('[avatar] Uploading to path:', filePath)

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, imageFile.value, {
      upsert:       true,
      contentType:  imageFile.value.type,
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
  saving.value      = true
  saveSuccess.value = false
  saveError.value   = ''
  uploadError.value = ''

  const userId = auth.user?.id
  if (!userId) { saving.value = false; return }

  console.log('[save] Starting save for user:', userId)
  console.log('[save] imageFile staged?', !!imageFile.value)

  try {
    const avatarUrl = await uploadAvatar(userId)

    const profilePayload = {
      fname:          form.fname.trim(),
      lname:          form.lname.trim(),
      middle_initial: form.middle_initial.trim() || null,
      birthdate:      form.birthdate || null,
      gender_id:      form.genderId ? parseInt(form.genderId) : null,
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

    if (profRes.error)    throw profRes.error
    if (contactRes.error) throw contactRes.error
    if (addressRes.error) throw addressRes.error

    await auth.fetchUserData(auth.user)

    imageFile.value   = null  // clear staged file after successful save
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
  <div class="h-full overflow-y-auto bg-gray-100 px-10 py-8">

    <!-- Loading skeleton -->
    <div v-if="loading" class="flex gap-8 items-start animate-pulse">
      <div class="w-52 flex flex-col items-center gap-4 pt-4">
        <div class="w-44 h-44 rounded-full bg-gray-300"></div>
        <div class="w-32 h-8 rounded-full bg-gray-300"></div>
      </div>
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
    <div v-else class="flex gap-8 items-start">

      <!-- Left: Avatar + Upload -->
      <div class="flex flex-col items-center gap-4 w-52 flex-shrink-0 pt-4">
        <div class="w-44 h-44 rounded-full overflow-hidden border-4 border-gray-300 bg-gray-200 relative">
          <img v-if="imagePreview" :src="imagePreview" alt="Profile" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <Icons icon="profile" class="w-20 h-20 text-gray-400" />
          </div>
          <!-- Badge shown when a new image is staged but not yet saved -->
          <div v-if="imageFile"
            class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
            Unsaved
          </div>
        </div>

        <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden" @change="handleImageUpload" />
        <button
          class="px-5 py-1.5 rounded-full border-2 border-gray-800 text-gray-800 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
          @click="triggerUpload">
          Upload Image
        </button>

        <!-- Upload validation error -->
        <p v-if="uploadError" class="text-red-500 text-xs text-center">{{ uploadError }}</p>

        <ul class="text-red-500 text-xs space-y-1 list-disc list-inside leading-snug">
          <li>Max file size is 2 MB</li>
          <li>Only JPG, PNG, and WEBP files are accepted</li>
          <li>Image must not violate the rules of the institution</li>
        </ul>
      </div>

      <!-- Right: Form Card -->
      <div class="flex-1 bg-white rounded-2xl shadow-sm p-8">

        <!-- Feedback banners -->
        <Transition name="fade">
          <div v-if="saveSuccess"
            class="mb-5 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 flex-shrink-0">
              <path d="M4 10l4 4 8-8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Profile saved successfully!
          </div>
        </Transition>
        <Transition name="fade">
          <div v-if="saveError"
            class="mb-5 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {{ saveError }}
          </div>
        </Transition>

        <!-- Last Name, First Name, M.I. -->
        <div class="flex gap-4 mb-5">
          <div class="flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Last name</label>
            <input v-model="form.lname" type="text" placeholder="Last name"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-1">First name</label>
            <input v-model="form.fname" type="text" placeholder="First name"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
          </div>
          <div class="w-20">
            <label class="block text-sm font-semibold text-gray-700 mb-1">M.I.</label>
            <input v-model="form.middle_initial" type="text" maxlength="3" placeholder="M.I."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
          </div>
        </div>

        <!-- Address + Birthdate -->
        <div class="flex gap-4 mb-5 items-end">
          <div class="flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <input v-model="form.address" type="text" placeholder="Full address"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
          </div>
          <div class="w-52">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Birthdate</label>
            <input v-model="form.birthdate" type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
          </div>
        </div>

        <!-- Contact Number, Email, Gender -->
        <div class="flex gap-4 mb-5">
          <div class="w-44">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
            <input v-model="form.phone" type="text" placeholder="09 123 45678"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              Email <span class="text-gray-400 font-normal text-xs">(read-only)</span>
            </label>
            <input :value="auth.email" type="email" disabled
              class="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
          </div>
          <div class="w-44">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
            <select v-model="form.genderId"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-700 bg-white cursor-pointer">
              <option value="">Choose</option>
              <option v-for="g in genders" :key="g.id" :value="g.id">{{ g.gender }}</option>
            </select>
          </div>
        </div>

        <!-- Bio -->
        <!-- <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
          <textarea v-model="form.bio" placeholder="Type something..."
            class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-700"
            rows="6" />
        </div> -->

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3">
          <button @click="loadProfileData" :disabled="saving"
            class="px-6 py-2 rounded-full border-2 border-gray-800 text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50">
            Reset
          </button>
          <button @click="handleSave" :disabled="saving"
            class="px-6 py-2 rounded-full bg-green-900 text-white font-semibold text-sm hover:bg-green-800 transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2">
            <svg v-if="saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round"/>
            </svg>
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>