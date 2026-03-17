<script setup>
import { useAuthStore } from '@/stores/useAuthStore';
import { ref, onMounted } from 'vue'
import Icons from '../Icons.vue';
import { useUnitStore } from '@/stores/unit';
import { usePosStore } from '@/stores/positions';
import { storeToRefs } from 'pinia';


const auth = useAuthStore()
const modal = ref(false)
const modalMode = ref('add')
const positions = usePosStore()
const units = useUnitStore()
const { posOnUnit } = storeToRefs(units)
const oldPos = ref(NaN)

defineProps([
    'loadingDropdowns',
])

const unitNames = auth.positions.map(p => p.unit_id)
const posNames = auth.positions.map(p => p.pos_id)

const localForm = ref({
    unit: null,
    position: null
})

// Handle position selection when changing unit
const clearPosOnUnitChange = async () => {
    if (!localForm.value.unit) return;
    await units.fetchUnitPeers(localForm.value.unit);
    localForm.value.position = null
}

const openAddModal = () => {
    modalMode.value = 'add'
    // Clear the form for a fresh entry
    localForm.value = { unit: null, position: null }
    modal.value = true
}

const openEditModal = async (payload) => {
    modalMode.value = 'edit'
    // Pre-fill the form with the existing data
    if (localForm.value) localForm.value = { unit: null, position: null }
    localForm.value = {
        unit: payload.unit_id,
        position: payload.pos_id
    }
    oldPos.value = payload.pos_id
    await units.fetchUnitPeers(payload.unit_id)
    modal.value = true
}

const openDeleteModal = (payload) => {
    modalMode.value = 'delete'
    if (localForm.value) localForm.value = { unit: null, position: null }
    localForm.value = {
        unit: payload.unit_id,
        position: payload.pos_id
    }
    modal.value = true
}

const handleSave = async () => {
    try {
        if (modalMode.value === 'add') {
            const response = await positions.addUserPos(localForm.value)
            console.log(response)
        } else if (modalMode.value === 'edit') {
            const response = await positions.updateUserPos(localForm.value, oldPos.value)
            console.log(response)
        } else {
            const response = await positions.deleteUserPos(localForm.value)
            console.log(response)
        }
        // Refresh the auth store so the table updates
        await auth.fetchUserData(auth.user)
    } catch (err) {
        console.error("Failed to save:", err)
    } finally {
        modal.value = false
    }
}

</script>

<template>
    <div class="flex flex-col gap-5">
        <table class="flex-1">
            <tr class="bg-green-900 text-white">
                <th v-for="head in ['Position', 'Unit', 'Action']" class="text-xl text-start px-5 py-2">{{ head }}</th>
            </tr>
            <tr v-for="(pos, index) in (auth.positions || [])" class="">
                <td class="py-4 px-5">{{ pos.pos_name }}</td>
                <td class="px-5">{{ pos.unit_name }}</td>
                <td v-if="![1, 4].includes(pos.pos_id)" class="flex flex-row items-center gap-3 py-4 px-5">
                    <Icons :icon="'edit'" class="hover:cursor-pointer" @click="openEditModal(pos)" />
                    <Icons :icon="'deleteOutline'" class="text-red-700 hover:cursor-pointer"
                        @click="openDeleteModal(pos)" />
                </td>
            </tr>
        </table>
        <div v-if="!auth.isDirector" class="self-center flex gap-3 bg-green-950 mt-5 px-4 py-3 rounded-full text-white hover:cursor-pointer"
            @click="openAddModal">
            <Icons :icon="'add'" />
            Add Position
        </div>

        <Teleport to="body" v-if="modal">
            <div class="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">

                <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-4">

                    <h2 class="text-xl font-bold border-b pb-2" 
                        :class="modalMode === 'delete' ? 'text-red-900' : 'text-green-900'">
                        {{
                            modalMode === 'add' ?
                                'Add New' :
                                modalMode === 'edit' ?
                                    'Edit' : 'Delete'
                        }} Position
                    </h2>

                    <template v-if="modalMode !== 'delete'">
                        <div class="flex-1 pb-3">
                            <p class="block text-sm font-semibold text-gray-700 mb-1">Unit</p>
                            <div v-if="loadingDropdowns" class="w-full h-10 rounded-lg bg-gray-200 animate-pulse"></div>
                            <select v-else v-model="localForm.unit" @change="clearPosOnUnitChange()"
                                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-700 bg-white cursor-pointer">
                                <option selected disabled :value="null">Select your unit</option>
                                <option v-for="u in units.unit" :key="u.id" :value="u.id">{{ u.name }}</option>
                            </select>
                        </div>

                        <div class="flex-1">
                            <p class="block text-sm font-semibold text-gray-700 mb-1">Position</p>

                            <div v-if="loadingDropdowns" class="w-full h-10 rounded-lg bg-gray-200 animate-pulse"></div>

                            <div v-else-if="!localForm.unit"
                                class="p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-sm flex items-center gap-2">
                                Select a unit first
                            </div>

                            <select v-else v-model="localForm.position"
                                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-700 bg-white cursor-pointer">
                                <option selected disabled :value="null">Select your position</option>
                                <option v-for="p in posOnUnit" :key="p.pos_id" :value="p.pos_id">
                                    {{ p.pos_name }}
                                </option>
                            </select>
                        </div>
                    </template>

                    <template v-else>
                        <div>
                            Are you sure you want to delete this position?
                        </div>
                    </template>

                    <div class="mt-4 flex justify-end gap-2 border-t pt-4">
                        <button @click="modal = false"
                            class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:cursor-pointer">Cancel</button>
                        <button
                            class="px-6 py-2 text-white rounded-lg text-sm font-bold shadow-lg transition-colors hover:cursor-pointer"
                            :class="modalMode === 'delete' ? 'bg-red-800 hover:bg-red-900' : 'bg-green-800 hover:bg-green-900 '"
                            @click="() => { modal = false; handleSave() }">
                            Confirm
                        </button>
                    </div>

                </div>
            </div>
        </Teleport>
    </div>
</template>