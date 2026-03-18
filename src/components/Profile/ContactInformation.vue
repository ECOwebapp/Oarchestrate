<script setup>
import { useContactStore } from '@/stores/contact';
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore';

const auth = useAuthStore()
const contact = useContactStore()

const form = ref({
    phone: [],
    email_address: []
})

const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

onMounted(async () => {
    await Promise.all([
        contact.fetchEmails(),
        contact.fetchPhoneNumbers()
    ])

    const userId = auth.user?.id || auth.userID
    if (!userId) {
        form.value.phone = ['']
        form.value.email_address = ['']
        return
    }

    const userPhones = contact.phone.filter(p => p.user_id === userId)
    const userEmail = contact.emails.filter(e => e.user_id === userId)
    // Extract just the strings into the form array
    form.value.phone = userPhones.map(p => p.phone)
    form.value.email_address = userEmail.map(e => e.email_address)
    if (form.value.phone.length === 0) form.value.phone = ['']
    if (form.value.email_address.length === 0) form.value.email_address = ['']

})

const handleSave = async () => {
    saving.value = true
    saveSuccess.value = false
    saveError.value = ''

    const userId = auth.user?.id
    if (!userId) { saving.value = false; return }

    try {

        if (form.value.email_address && form.value.email_address.length > 0) {
            const response = await contact.editUserEmail(form.value.email_address)
            console.log('Email: ', response)
        }

        if (form.value.phone && form.value.phone.length > 0) {
            const response = await contact.editPhoneNumber(form.value.phone)
            console.log('Phone: ', response)
        }

        await auth.fetchUserData(auth.user)
    } catch (e) {
        console.log('Error processing forms: ', e)
        saveError.value = err.message || 'Something went wrong.'
    } finally {
        saving.value = false
    }
}

</script>

<template>
    <div class="flex flex-col gap-4 mb-5">
        <div class="flex gap-5">
            <div class="flex flex-col">
                <label for="phone" class="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                <div v-for="(num, index) in form.phone" :key="index" class="relative">
                    <input v-model="form.phone[index]" type="tel" inputmode="numeric" pattern="^09\d{9}$"
                        placeholder="09 123 45678" maxlength="11" class="w-100 border border-gray-300 rounded-lg px-4 py-2 text-md text-gray-600 
                   focus:text-black focus:outline-none focus:ring-1 focus:ring-green-700 mb-5" />
                </div>

                <button type="button" @click="form.phone.push('')"
                    class="w-30 self-center bg-green-950 text-white rounded-md p-2 hover:cursor-pointer">Add
                    phone</button>
            </div>

            <div class="flex flex-col flex-1">
                <label for="email" class="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                </label>
                <div v-for="(num, index) in form.email_address" :key="index" class="relative">
                    <input v-model="form.email_address[index]" type="email" id="email"
                        class="w-full border border-gray-300 rounded-lg px-4 py-2 text-md text-gray-600 focus:text-black ocus:outline-none focus:ring-1 focus:ring-green-700 mb-5" />
                </div>

                <button type="button" @click="form.email_address.push('')"
                    class="w-30 self-center bg-green-950 text-white rounded-md p-2 hover:cursor-pointer">Add
                    email</button>
            </div>

        </div>
    </div>
    <!-- Action Buttons -->
    <div class="flex justify-end gap-3">
        <button @click="auth.fetchUserData(auth.user)" :disabled="saving"
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
</template>