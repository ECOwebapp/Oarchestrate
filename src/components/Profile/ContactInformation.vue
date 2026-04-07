<script setup vapor>
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

defineExpose({saveSuccess, saveError})

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
    <div class="mb-5 flex flex-col gap-4">
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div class="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <label for="phone" class="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Contact Number</label>
                <div v-for="(num, index) in form.phone" :key="index" class="relative">
                    <input v-model="form.phone[index]" type="tel" inputmode="numeric" pattern="^09\d{9}$"
                        placeholder="09 123 45678" maxlength="11" class="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-gray-700 shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition focus:border-emerald-600 focus:text-black focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                </div>

                <button type="button" @click="form.phone.push('')"
                    class="self-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 transition-all hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-sm hover:cursor-pointer">Add
                    phone</button>
            </div>

            <div class="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <label for="email" class="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                </label>
                <div v-for="(num, index) in form.email_address" :key="index" class="relative">
                    <input v-model="form.email_address[index]" type="email" id="email"
                        class="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-gray-700 shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition focus:border-emerald-600 focus:text-black focus:outline-none focus:ring-2 focus:ring-emerald-100" />
                </div>

                <button type="button" @click="form.email_address.push('')"
                    class="self-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900 transition-all hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-sm hover:cursor-pointer">Add
                    email</button>
            </div>

        </div>
    </div>
    <!-- Action Buttons -->
    <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button @click="auth.fetchUserData(auth.user)" :disabled="saving"
            class="w-full rounded-full border border-rose-300 bg-white px-6 py-2 text-sm font-semibold text-rose-700 transition-all hover:-translate-y-0.5 hover:bg-rose-50 hover:shadow-sm cursor-pointer disabled:opacity-50 sm:w-auto">
            Reset
        </button>
        <button @click="handleSave" :disabled="saving"
            class="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-800 to-green-700 px-6 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(4,120,87,0.25)] transition-all hover:-translate-y-0.5 hover:from-emerald-700 hover:to-green-600 hover:shadow-[0_10px_24px_rgba(4,120,87,0.32)] cursor-pointer disabled:opacity-60 sm:w-auto">
            <svg v-if="saving" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round" />
            </svg>
            {{ saving ? 'Saving…' : 'Save' }}
        </button>
    </div>
</template>