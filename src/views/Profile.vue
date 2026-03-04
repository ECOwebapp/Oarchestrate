<script setup>
import { ref } from 'vue'
import Icons from '@/components/Icons.vue'

const form = ref({
  lastName: '',
  firstName: '',
  mi: '',
  address: '',
  birthDD: '',
  birthMM: '',
  birthYYYY: '',
  contactNumber: '',
  email: '',
  gender: '',
  bio: '',
})

const imagePreview = ref(null)
const fileInput = ref(null)

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) return
  if (file.size > 2 * 1024 * 1024) return
  const reader = new FileReader()
  reader.onload = (ev) => { imagePreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

const triggerUpload = () => fileInput.value?.click()
</script>

<template>
  <div class="h-full overflow-y-auto bg-gray-100 px-10 py-8">
    <div class="flex gap-8 items-start">

      <!-- Left: Avatar + Upload -->
      <div class="flex flex-col items-center gap-4 w-52 flex-shrink-0 pt-4">
        <div class="w-44 h-44 rounded-full overflow-hidden border-4 border-gray-300 bg-gray-200">
          <img v-if="imagePreview" :src="imagePreview" alt="Profile" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            <Icons icon="profile" class="w-20 h-20 text-gray-400" />
          </div>
        </div>
        <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden" @change="handleImageUpload" />
        <button
          class="px-5 py-1.5 rounded-full border-2 border-gray-800 text-gray-800 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
          @click="triggerUpload">
          Upload Image
        </button>
        <ul class="text-red-500 text-xs space-y-1 list-disc list-inside leading-snug">
          <li>Max file size is 2 MB</li>
          <li>Only JPG, PNG, and WEBP files are accepted</li>
          <li>Image must not violate the rules of the institution</li>
        </ul>
      </div>

      <!-- Right: Form Card -->
      <div class="flex-1 bg-white rounded-2xl shadow-sm p-8">
        <!-- Last Name, First Name, M.I. -->
        <div class="flex gap-4 mb-5">
          <div class="flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Last name</label>
            <input v-model="form.lastName" type="text" placeholder="Last name"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-1">First name</label>
            <input v-model="form.firstName" type="text" placeholder="First name"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
          </div>
          <div class="w-20">
            <label class="block text-sm font-semibold text-gray-700 mb-1">M.I.</label>
            <input v-model="form.mi" type="text" maxlength="3" placeholder="M.I."
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
            <div class="flex gap-1">
              <input v-model="form.birthDD" type="text" placeholder="DD" maxlength="2"
                class="w-14 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-700" />
              <input v-model="form.birthMM" type="text" placeholder="MM" maxlength="2"
                class="w-14 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-700" />
              <input v-model="form.birthYYYY" type="text" placeholder="YYYY" maxlength="4"
                class="w-20 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-700" />
            </div>
          </div>
        </div>

        <!--Contact Number, Email, Gender -->
        <div class="flex gap-4 mb-5">
          <div class="w-44">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
            <input v-model="form.contactNumber" type="text" placeholder="09 123 45678"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" placeholder="sample@carsu.edu.ph"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
          </div>
          <div class="w-44">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
            <select v-model="form.gender"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-500 focus:outline-none focus:ring-1 focus:ring-green-700 bg-white cursor-pointer">
              <option value="">Choose</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>
        </div>

        <!-- Row 4: Bio -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
          <textarea v-model="form.bio" placeholder="Type something..."
            class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-700"
            rows="6" />
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3">
          <button
            class="px-6 py-2 rounded-full border-2 border-gray-800 text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-colors cursor-pointer">
            Preview
          </button>
          <button
            class="px-6 py-2 rounded-full bg-green-900 text-white font-semibold text-sm hover:bg-green-800 transition-colors cursor-pointer">
            Save
          </button>
        </div>
      </div>

    </div>
  </div>
</template>