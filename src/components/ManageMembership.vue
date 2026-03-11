<script setup>
import { storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useMemberStore } from '@/stores/member';
import { useNotifStore } from '@/stores/useNotifStore';
import { useRolePosStore } from '@/stores/roles';

// 1. Use storeToRefs to keep the properties reactive
const memberStore = useMemberStore()
const notifStore = useNotifStore()
const roleStore = useRolePosStore()
const { members } = storeToRefs(memberStore)
const { roles, memberRoles } = storeToRefs(roleStore)
const loading = ref({
    update: false,
    delete: false
})

const pendingMembers = computed(() => {
    // 1. Create the list of expected notification IDs (e.g., ["reg-uuid1", "reg-uuid2"])
    const validRegIds = members.value.map(m => `reg-${m.id}`);

    // 2. Filter notifications to find only those in our list
    return notifStore.notifs.filter(n => validRegIds.includes(n.id));
})

const normalMembers = computed(() => {
    return members.value.filter(m => m.status_id === 2)
})

const isActing = (n) => n.status === 'approving' || n.status === 'denying'

const changeRoleMembers = ref({
    user_id: null,
    role_id: null
})

const deleteMember = ref({ user_id: null })

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

// Change Member Roles to Director/Unit Head/Unit Member
const submitChangeRole = async () => {
    try {
        loading.value.update = true
        const response = await roleStore.changeMemberRoles({ member: { ...changeRoleMembers.value } })
        if (response === 200) console.log(response)
    } catch (e) {
        console.log('Error submission: ', e)
    } finally {
        changeRoleMembers.value = {
            user_id: null,
            role_id: null
        }
        loading.value.update = false
    }
}

// Remove Members
const removeMember = async () => {
    try {
        loading.value.delete = true
        const response = await memberStore.removeMember({ member: { ...deleteMember.value } })
        if (response === 200) console.log(response)
    } catch (e) {
        console.log('Error removal: ', e)
    } finally {
        deleteMember.value = { user_id: null }
        loading.value.delete = false
    }
}

</script>

<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">

        <div class="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <h2 class="text-lg font-bold mb-6 text-gray-800">Approve Members</h2>

            <div class="space-y-4">
                <div v-for="(member, i) in pendingMembers" :key="member.id"
                    class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <svg class="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                            </svg>
                        </div>
                        <span class="font-semibold text-gray-700">{{ member.title }}</span>
                    </div>
                    <div class="flex gap-2">
                        <button @click="notifStore.approveUser(member.userId)" :disabled="isActing(member)"
                            class="flex justify-center items-center gap-2 px-4 py-1 bg-green-700 text-white text-xs font-bold rounded-lg hover:bg-green-800 transition-colors hover:cursor-pointer disabled:cursor-not-allowed">
                            <svg v-if="member.status === 'approving'" class="animate-spin w-3 h-3" viewBox="0 0 24 24"
                                fill="none">
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3" />
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3"
                                    stroke-linecap="round" />
                            </svg>
                            {{ member.status === 'approving' ? 'Approving…' : 'Approve' }}
                        </button>
                        <button @click="notifStore.denyUser(member.userId)" :disabled="isActing(member)"
                            class="flex justify-center items-center gap-2 px-4 py-1 border-2 border-red-500 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50 transition-colors">
                            <svg v-if="member.status === 'denying'" class="animate-spin w-3 h-3" viewBox="0 0 24 24"
                                fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.3"
                                    stroke-width="3" />
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3"
                                    stroke-linecap="round" />
                            </svg>
                            {{ member.status === 'denying' ? 'Denying…' : 'Deny' }}
                        </button>
                    </div>
                </div>
                <p v-if="pendingMembers.length === 0" class="text-gray-500 text-center italic">No pending requests.
                </p>
            </div>
        </div>

        <div class="flex flex-col gap-8">
            <div class="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <h2 class="text-lg font-bold mb-6 text-gray-800">Change Position</h2>

                <form @submit.prevent="submitChangeRole">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Member:</label>
                            <select v-model="changeRoleMembers.user_id"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-50"
                                :disabled="loading?.update">
                                <option disabled selected :value="null">-- Select a member --</option>
                                <option v-for="member in normalMembers" :key="member.id" :value="member.id">{{
                                    member.fname }} {{
                                        member.middle_initial }} {{ member.lname }}</option>
                            </select>
                            <p class="text-xs text-red-500 mt-1">* Not 2 members at the same time</p>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Position:</label>
                            <select v-model="changeRoleMembers.role_id"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-50"
                                :disabled="loading?.update">
                                <option disabled selected :value="null">-- Select position --</option>
                                <option v-for="role in availableRoles" :key="role.id" :value="role.id">{{ role.name }}
                                </option>
                            </select>
                        </div>

                        <button type="submit" :disabled="loading?.update"
                            class="flex justify-center items-center gap-2 w-full mt-2 px-4 py-2 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition-colors hover:cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                            <svg v-if="loading?.update" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3" />
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3"
                                    stroke-linecap="round" />
                            </svg>
                            <span>{{ loading?.update ? 'Confirming…' : 'Confirm' }}</span>
                        </button>
                    </div>
                </form>
            </div>

            <div class="bg-white rounded-lg p-6 shadow-md border border-gray-100">
                <h2 class="text-lg font-bold mb-6 text-gray-800">Remove Member</h2>

                <form @submit.prevent="removeMember">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Member:</label>
                            <select v-model="deleteMember.user_id"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-50"
                                :disabled="loading?.delete">
                                <option disabled selected value="">-- Select a member --</option>
                                <option v-for="member in normalMembers" :key="member.id" :value="member.id">{{
                                    member.fname }} {{
                                        member.middle_initial }} {{ member.lname }}</option>
                            </select>
                            <p class="text-xs text-red-500 mt-1">* Not 2 members at the same time</p>
                        </div>

                        <button :disabled="loading?.delete" type="submit"
                            class="w-full mt-4 px-4 py-2 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition-colors flex justify-center items-center gap-2 hover:cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                            <svg v-if="loading?.delete" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3" />
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3"
                                    stroke-linecap="round" />
                            </svg>
                            <span>{{ loading?.delete ? 'Removing…' : 'Remove' }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>