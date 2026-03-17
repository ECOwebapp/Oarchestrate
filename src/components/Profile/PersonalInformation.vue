<script setup>
import Icons from '../Icons.vue';
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore';
import { useGenderStore } from '@/stores/gender';
import { storeToRefs } from 'pinia';
import AddressEdit from './AddressEdit.vue';
import { useAddressStore } from '@/stores/address'

const addressStore = useAddressStore()
const auth = useAuthStore()
const genders = useGenderStore()
const { gender } = storeToRefs(genders)
const { userAddress } = storeToRefs(addressStore)

const props = defineProps([
    'saving',
    'saveSuccess',
    'saveError'
])
const fileInput = ref(null)
const showPassword = ref(false)
const errors = reactive({})
const showConfirm = ref(false)
const imagePreview = ref(null)
const uploadError = ref('')   // separate error just for avatar
const imageFile = ref(null)  // holds the actual File object
const addressInfo = ref(null)

const form = reactive({
    fname: '',
    middle_initial: '',
    lname: '',
    birthdate: '',
    genderId: NaN,
    regionCode: '',
    provinceCode: '',
    cityCode: '',
    barangayCode: '',
    password: '',
    confirmPassword: ''
})

onMounted(async () => {

    // Use .find() to get the first matching object
    const matchingGender = gender.value.find(g => g.type === auth.profile.gender)

    // Extract the ID safely
    const genderId = matchingGender ? matchingGender.id : NaN

    form.fname = auth.profile.fname || ''
    form.middle_initial = auth.profile.middle_initial || ''
    form.lname = auth.profile.lname || ''
    form.birthdate = auth.profile.birthdate || ''
    form.genderId = genderId || NaN
    form.regionCode = userAddress.value.region_code || ''
    form.provinceCode = userAddress.value.province_code || ''
    form.cityCode = userAddress.value.city_code || ''
    form.barangayCode = userAddress.value.barangay_code || ''
    if (auth.profile.avatar_url) {
        const base = auth.profile.avatar_url.split('?')[0]
        imagePreview.value = `${base}?t=${Date.now()}`
    }
})

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

const passwordStrength = computed(() => {
    const p = form.password
    if (!p) return { label: '', pct: 0, color: '#e5e7eb' }
    let s = 0
    if (p.length >= 8) s++
    if (p.length >= 12) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    if (s <= 2) return { label: 'Weak', pct: 33, color: '#ef4444' }
    if (s <= 3) return { label: 'Fair', pct: 66, color: '#ca8a04' }
    return { label: 'Strong', pct: 100, color: '#15803d' }
})

const clearError = (field) => { delete errors[field] }

const handleSave = async () => {
    props.saving = true
    props.saveSuccess = false
    props.saveError = ''
    uploadError.value = ''

    const userId = auth.user?.id
    if (!userId) { saving.value = false; return }

    console.log('[save] Starting save for user:', userId)
    console.log('[save] imageFile staged?', !!imageFile.value)

    try {
        const avatarUrl = await uploadAvatar(userId)

        const profilePayload = Object.fromEntries(
            Object.entries({
                fname: form.fname?.trim(),
                lname: form.lname?.trim(),
                middle_initial: form.middle_initial?.trim() || null,
                birthdate: form.birthdate || null,
                gender_id: form.genderId ? parseInt(form.genderId) : null,
                avatar_url: avatarUrl || null
            }).filter(([_, value]) => value !== null && value !== '' && !Number.isNaN(value))
        );

        if (addressInfo.value) {
            const addressPayload = {
                region_code: form.regionCode,
                province_code: form.provinceCode,
                city_code: form.cityCode,
                barangay_code: form.barangayCode,
                address: addressInfo.value.fullAddress
            }

            const response = await addressStore.changeUserAddress(addressPayload)
            console.log('Address: ', response)
        }

        const response = await auth.editProfile(profilePayload)
        console.log('Profile: ', response)

        await auth.fetchUserData(auth.user)

        imageFile.value = null  // clear staged file after successful save
        props.saveSuccess = true
        setTimeout(() => props.saveSuccess = false, 3000)
    } catch (err) {
        console.error('[save] Error:', err)
        saveError.value = err.message || 'Something went wrong.'
    } finally {
        props.saving = false
    }
}

</script>

<template>
    <div class="flex flex-row gap-5">
        <div class="flex flex-col items-center gap-5 w-100 flex-shrink-0 pt-4">
            <div class="w-70 h-70 rounded-full overflow-hidden border-4 border-gray-300 bg-gray-200 relative">
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

            <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden"
                @change="handleImageUpload" />
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

        <div class="flex-1">
            <!-- Last Name, First Name, M.I. -->
            <div class="flex gap-4 mb-5">
                <div class="flex-1">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Last name</label>
                    <input v-model="form.lname" type="text" placeholder="Last name"
                        class="w-full border border-gray-300 rounded-lg p-4 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
                </div>
                <div class="flex-1">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">First name</label>
                    <input v-model="form.fname" type="text" placeholder="First name"
                        class="w-full border border-gray-300 rounded-lg p-4 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
                </div>
                <div class="w-20">
                    <label class="block text-sm font-semibold text-gray-700 mb-1">M.I.</label>
                    <input v-model="form.middle_initial" type="text" maxlength="3" placeholder="M.I."
                        class="w-full border border-gray-300 rounded-lg p-4 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
                </div>
            </div>

            <!-- Address + Birthdate -->
            <div class="flex flex-col gap-4 mb-5">
                <div class="flex-1">
                    <AddressEdit :form="form" :errors="errors" :clear-error="clearError" ref="addressInfo" />
                </div>

                <div class="flex flex-row gap-4">
                    <div class="flex-1">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Birthdate</label>
                        <input v-model="form.birthdate" type="date"
                            class="w-full border border-gray-300 rounded-lg p-4 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                        <select v-model="form.genderId"
                            class="w-full border border-gray-300 rounded-lg p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white cursor-pointer">
                            <option :selected="form.genderId !== NaN" disabled :value="NaN">Choose</option>
                            <option v-for="g in gender" :key="g.id" :value="g.id">{{ g.type }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="flex gap-4 mb-5">

                <!-- Password -->
                <div class="flex-1">
                    <p class="block text-sm font-semibold text-gray-700 mb-1">Change Password</p>
                    <div class="relative">
                        <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Password"
                            @input="clearError('password')"
                            class="w-full p-4 rounded-lg border text-gray-700 bg-white text-sm placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                            :class="errors.password ? 'border-red-400' : 'border-gray-300'" />
                        <button type="button" @click="showPassword = !showPassword"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                            <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="1.8" class="w-5 h-5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                class="w-5 h-5">
                                <path
                                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        </button>
                    </div>
                    <div v-if="form.password" class="flex items-center gap-2 mt-1.5">
                        <div class="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-300"
                                :style="{ width: passwordStrength.pct + '%', background: passwordStrength.color }">
                            </div>
                        </div>
                        <span class="text-xs font-semibold" :style="{ color: passwordStrength.color }">
                            {{ passwordStrength.label }}
                        </span>
                    </div>
                    <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
                </div>

                <!-- Confirm Password -->
                <div class="flex-1">
                    <p class="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</p>
                    <div class="relative">
                        <input v-model="form.confirmPassword" :type="showConfirm ? 'text' : 'password'"
                            placeholder="Confirm Password" @input="clearError('confirmPassword')"
                            class="w-full p-4 rounded-lg border text-gray-700 bg-white text-sm placeholder-gray-400 transition focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                            :class="errors.confirmPassword ? 'border-red-400' : 'border-gray-300'" />
                        <button type="button" @click="showConfirm = !showConfirm"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                            <svg v-if="!showConfirm" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="1.8" class="w-5 h-5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
                                class="w-5 h-5">
                                <path
                                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        </button>
                    </div>
                    <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
                </div>
            </div>

        </div>
    </div>
    <!-- Action Buttons -->
    <div class="flex justify-end gap-3">
        <button @click="auth.fetchUserData(auth.user)" :disabled="props.saving"
            class="px-6 py-2 rounded-full border-2 border-red-800 text-red-800 font-semibold text-sm hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50">
            Reset
        </button>
        <button @click="handleSave" :disabled="props.saving"
            class="px-6 py-2 rounded-full bg-green-900 text-white font-semibold text-sm hover:bg-green-800 transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2">
            <svg v-if="props.saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round" />
            </svg>
            {{ saving ? 'Saving…' : 'Save' }}
        </button>
    </div>
</template>