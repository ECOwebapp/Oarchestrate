import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { apiFetch } from "@/lib/api";

export const useMemberStore = defineStore('member', () => {

    const members = ref([])
    const loading = ref(false)

    const fetchMembers = async () => {
        try {
            loading.value = true
            const response = await apiFetch('/users_info/fetch_members', { method: 'GET' })
            const result = await response.json()
            if(response.ok) members.value = result.members || []
        } catch (e) {
            console.log('Failed to fetch members: ', e)
        } finally {
            loading.value = false
        }
    }

    const removeMember = async ({ member }) => {
        try {
            const response = await apiFetch('/users_info/remove_members', {
                method: 'POST',
                body: JSON.stringify({ userId: member.user_id })
            })
            const result = await response.json()
            if (response.ok){
                members.value = result.members || []
                return response.status
            }
        } catch (e) {
            console.log('Error removing: ', e)
        }
    }

    return { loading, members, fetchMembers, removeMember }
})