import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAuthStore } from "./useAuthStore";
import { apiFetch } from "@/lib/api";

export const usePosStore = defineStore('pos', () => {
    const position = ref([])
    const roles = ref([])
    const memberPos = ref([])
    const auth = useAuthStore()

    const fetchPos = async () => {
        try {
            const response = await apiFetch('/office/fetch_pos', { method: 'GET' })
            const result = await response.json()

            if (response.ok) position.value = result.data

        } catch (e) {
            console.log(`Error: ${e}`)
        }
    }

    const fetchRoles = async () => {
        try {
            const response = await apiFetch('/office/fetch_pos', { method: 'GET' })
            const result = await response.json()

            if (response.ok) roles.value = result.data
        } catch (e) {
            console.log('Failed to fetch roles: ', e)
        }
    }
    
    const fetchMemberPos = async () => {
        try {
            const response = await apiFetch('/office/fetch_member_pos', { method: 'GET' })
            const result = await response.json()
            if (response.ok) memberPos.value = result.data

        } catch (e) {
            console.log('Error: ', e)
        }
    }

    const changeMemberRoles = async ({ member }) => {
        try {
            const response = await apiFetch('/office/change_roles', {
                method: 'POST',
                body: JSON.stringify({
                    userId: member.user_id,
                    posId: member.pos_id,
                    unitId: member.unit_id
                })
            })
            const result = await response.json()
            if (response.ok) {
                memberPos.value = result.data
                return response.status
            }
        } catch (e) {
            console.log('Error: ', e)
        }
    }

    const addUserPos = async (user) => {
        try {
            const response = await apiFetch('/office/add_user_pos', {
                method: 'POST',
                body: JSON.stringify({ posId: user.position, unitId: user.unit })
            })
            if (response.ok) {
                await auth.fetchUserData()
                return response.status
            }
        } catch (e) {
            console.log('Error adding position: ', e)
        }
    }

    const updateUserPos = async (user, old_pos) => {
        try {
            const response = await apiFetch('/office/update_user_pos', {
                method: 'POST',
                body: JSON.stringify({ posId: user.position, unitId: user.unit, old_pos })
            })
            if (response.ok) {
                await auth.fetchUserData()
                return response.status
            }
        } catch (e) {
            console.log('Error updating position: ', e)
        }
    }

    const deleteUserPos = async (user) => {
        try {
            const response = await apiFetch('/office/delete_user_pos', {
                method: 'POST',
                body: JSON.stringify({ posId: user.position })
            })
            if (response.ok) {
                await auth.fetchUserData()
                return response.status
            }
        } catch (e) {
            console.log('Error deleting position: ', e)
        }
    }

    return {
        position,
        roles,
        fetchPos,
        fetchRoles,
        memberPos,
        fetchMemberPos,
        changeMemberRoles,
        addUserPos,
        updateUserPos,
        deleteUserPos
    }
})