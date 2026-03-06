<script setup>
import { storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useMemberStore } from '@/stores/member';
import { useRolePosStore } from '@/stores/roles';

// 1. Use storeToRefs to keep the properties reactive
const memberStore = useMemberStore()
const roleStore = useRolePosStore()
const { members } = storeToRefs(memberStore)
const { roles, memberRoles } = storeToRefs(roleStore)

const pendingMembers = computed(() => {
    return members.value.filter(m => m.status === 'pending')
})

const normalMembers = computed(() => {
    return members.value.filter(m => m.status === 'approved')
})

const changeRoleMembers = ref({
    user_id: null,
    role_id: null
})

const availableRoles = computed(() => {
    const selectedUserId = changeRoleMembers.value.user_id;

    // 1. If no ID is selected, return all roles
    if (!selectedUserId) return roles.value;

    // 2. Find the user, forcing both IDs to String and trimming whitespace
    const currentMember = memberRoles.value.find(p => {
        return String(p.user_id).trim() === String(selectedUserId).trim();
    });

    // 3. If member not found in the roles list, return all roles
    if (!currentMember) return roles.value;

    // 4. Filter out the current role ID (also forcing string comparison)
    return roles.value.filter(r => {
        return String(r.id) !== String(currentMember.role_id);
    });
});

console.log(changeRoleMembers.value)

const submitChangeRole = async () => {

}

</script>

<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">

        <div class="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <h2 class="text-lg font-bold mb-6 text-gray-800">Approve Members</h2>

            <div class="space-y-4">
                <div v-for="member in pendingMembers" :key="member.name"
                    class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                            </svg>
                        </div>
                        <span class="font-semibold text-gray-700">{{ member.fname }} {{ member.middle_initial }} {{
                            member.lname }}</span>
                    </div>
                    <div class="flex gap-2">
                        <button
                            class="px-4 py-1 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-800 transition-colors">Approve</button>
                        <button
                            class="px-4 py-1 border-2 border-red-500 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors">Decline</button>
                    </div>
                </div>
                <p v-if="pendingMembers.length === 0" class="text-gray-500 text-center italic">No pending requests.</p>
            </div>
        </div>

        <div class="flex flex-col gap-8">
            <div class="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <h2 class="text-lg font-bold mb-6 text-gray-800">Change Position</h2>

                <form @submit.prevent="submitChangeRole">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Member:</label>
                            <select v-model="changeRoleMembers.user_id" @change="console.log('DOM Level Change:', changeRoleMembers.user_id)"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700">
                                <option disabled selected :value="null">-- Select a member --</option>
                                <option v-for="member in normalMembers" :key="member.user_id" :value="member.user_id">{{
                                    member.fname }} {{
                                        member.middle_initial }} {{ member.lname }}</option>
                            </select>
                            <p class="text-xs text-red-500 mt-1">* Not 2 members at the same time</p>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Position:</label>
                            <select v-model="changeRoleMembers.role_id"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700">
                                <option disabled selected :value="null">-- Select position --</option>
                                <option v-for="role in availableRoles" :key="role.id"
                                    :value="role.id">{{ role.name }}</option>
                            </select>
                        </div>

                        <button type="submit"
                            class="w-full mt-2 px-4 py-2 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition-colors">Confirm</button>
                    </div>
                </form>
            </div>

            <div class="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <h2 class="text-lg font-bold mb-6 text-gray-800">Remove Member</h2>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Member:</label>
                        <select
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700">
                            <option disabled selected value="">-- Select a member --</option>
                            <option v-for="member in normalMembers" :key="member.user_id">{{ member.fname }} {{
                                member.middle_initial }} {{ member.lname }}</option>
                        </select>
                        <p class="text-xs text-red-500 mt-1">* Not 2 members at the same time</p>
                    </div>

                    <button
                        class="w-full mt-4 px-4 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors">Remove</button>
                </div>
            </div>
        </div>
    </div>
</template>