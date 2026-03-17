<script setup>
import Icons from '../Icons.vue';
import { ref } from 'vue'
const props = defineProps([
    'imagePreview',
    'imageFile',
    'handleImageUpload',
    'triggerUpload',
    'uploadError',
    'form',
    'genders'
])
const fileInput = ref(null)
defineExpose({ fileInput })
</script>

<template>
    <div class="flex flex-row gap-5">
        <div class="flex flex-col items-center gap-5 w-100 flex-shrink-0 pt-4">
            <div class="w-70 h-70 rounded-full overflow-hidden border-4 border-gray-300 bg-gray-200 relative">
                <img v-if="props.imagePreview" :src="props.imagePreview" alt="Profile"
                    class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <Icons icon="profile" class="w-20 h-20 text-gray-400" />
                </div>
                <!-- Badge shown when a new image is staged but not yet saved -->
                <div v-if="props.imageFile"
                    class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Unsaved
                </div>
            </div>

            <input ref="fileInput" type="file" accept=".jpg,.jpeg,.png,.webp" class="hidden"
                @change="props.handleImageUpload" />
            <button
                class="px-5 py-1.5 rounded-full border-2 border-gray-800 text-gray-800 text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                @click="props.triggerUpload">
                Upload Image
            </button>

            <!-- Upload validation error -->
            <p v-if="props.uploadError" class="text-red-500 text-xs text-center">{{ props.uploadError }}</p>

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
            <div class="w-44">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                <select v-model="form.genderId"
                    class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-700 bg-white cursor-pointer">
                    <option :selected="form.genderId !== ''" disabled value="">Choose</option>
                    <option v-for="g in genders" :key="g.id" :value="g.id">{{ g.gender }}</option>
                </select>
            </div>

            <!-- Bio -->
            <div class="mb-6">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                <textarea placeholder="Type something..."
                    class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-green-700"
                    rows="6" />
            </div>
        </div>
    </div>
</template>