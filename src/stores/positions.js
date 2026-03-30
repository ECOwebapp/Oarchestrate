import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from "./useAuthStore";

export const usePosStore = defineStore('pos', () => {
    const position = ref([])
    const roles = ref([])
    const memberPos = ref([])
    const auth = useAuthStore()

    const fetchPos = async () => {
        try {
            const { data: posRows, error: posErr } = await supabase
                .from('position_name')
                .select('id, pos_name')

            if (posErr) throw posErr

            position.value = (posRows || [])
                .filter(p => p.name !== 'Admin')
                .map(p => ({
                    id: p.id,
                    name: p.pos_name
                }))

        } catch (e) {
            console.log(`Error: ${e}`)
        }
    }

    const fetchRoles = async () => {
        try {
            const { data, error } = await supabase.rpc('get_roles')

            if (error) throw error

            roles.value = data
        } catch (e) {
            console.log('Failed to fetch roles: ', e)
        }
    }

    // Queries the raw `position` table (not the view) so ALL rows per user
    // are returned — users with multiple positions are fully represented.
    const fetchMemberPos = async () => {
        try {
            const { data: posRows, error: posErr } = await supabase
                .from('position')
                .select('user_id, pos_id, unit_id')

            if (posErr) throw posErr

            memberPos.value = (posRows || []).map(p => ({
                user_id: p.user_id,
                pos_id:  p.pos_id,
                unit_id: p.unit_id,
            }))

        } catch (e) {
            console.log('Error: ', e)
        }
    }

    const changeMemberRoles = async ({ member }) => {
        try {
            const { data: updateRow, error: updateErr, status } = await supabase.rpc('promotion', {
                target_user_id: member.user_id,
                target_pos_id:  member.pos_id,
                target_unit_id: member.unit_id
            })

            if (updateErr) throw updateErr
            if (status === 200) {
                await fetchMemberPos()
                console.log(updateRow)
                return status
            }
        } catch (e) {
            console.log('Error: ', e)
        }
    }

    const addUserPos = async (user) => {
        try {
            const { data, error, status } = await supabase
                .from('position')
                .insert({ user_id: auth.userID, pos_id: user.position, unit_id: user.unit })

            if (error) throw error
            await auth.fetchUserData(auth.user, true)
            return status
        } catch (e) {
            console.log('Error adding position: ', e)
        }
    }

    const updateUserPos = async (user, old_pos) => {
        try {
            const { data, error, status } = await supabase
                .from('position')
                .update({ pos_id: user.position, unit_id: user.unit })
                .eq('user_id', auth.userID)
                .eq('pos_id', old_pos)

            if (error) throw error
            await auth.fetchUserData(auth.user, true)
            return status
        } catch (e) {
            console.log('Error updating position: ', e)
        }
    }

    const deleteUserPos = async (user) => {
        try {
            const { data, error, status } = await supabase
                .from('position')
                .delete()
                .eq('pos_id', user.position)

            if (error) throw error
            await auth.fetchUserData(auth.user, true)
            return status
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