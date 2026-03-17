<script setup>
const props = defineProps(['form', 'email'])

</script>

<template>
    <div class="flex flex-col gap-4 mb-5">
        <div class="w-44">
            <label class="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
            <input v-model="form.phone" type="text" placeholder="09 123 45678"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-700" />
        </div>
        <div class="flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-1">
                Email <span class="text-gray-400 font-normal text-xs">(read-only)</span>
            </label>
            <input :value="email" type="email" disabled
                class="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
        </div>
    </div>
</template>