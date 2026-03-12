import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from '@/lib/supabaseClient'

export const usePosStore = defineStore('pos', () => {
    const position = ref([])
    const roles = ref([])
    const memberPos = ref([])

    const fetchPos = async () => {

        try {
            const { data: posRows, error: posErr } = await supabase
                .from('position_name')
                .select('id, pos_name')

            if (posErr) throw posErr

            position.value = (posRows || [])
                .filter(p => p.name !== 'Admin' )
                .map(p => ({
                    id: p.id,
                    name: p.pos_name
                }))

        } catch (e) {
            console.log(`Error: ${e}`)
        }
    }

    const fetchRoles = async() => {
        try{
            const { data, error } = await supabase.rpc('get_roles')

            if (error) throw error

            roles.value = data
        } catch(e) {
            console.log('Failed to fetch roles: ', e)
        } finally {
            // console.log(roles.value)
        }
    }

    const fetchMemberPos = async() => {
        try{
            const { data: posRows, error: posErr } = await supabase
                .from('position_of_members')
                .select('user_id, pos_id, unit_id')

            if(posErr) throw posErr

            memberPos.value = (posRows || [])
                .map(p => ({
                    user_id: p.user_id,
                    pos_id: p.pos_id,
                    unit_id: p.unit_id
                }))

                // console.log(memberPos.value)

        } catch (e){
            console.log('Error: ', e)
        }
    }

    const changeMemberRoles = async({ member }) => {
        try {
            const { data: updateRow, error: updateErr, status } = await supabase.rpc('promotion', {
                target_user_id: member.user_id,
                target_pos_id: member.pos_id,
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

    return { position, roles, fetchPos, fetchRoles, memberPos, fetchMemberPos, changeMemberRoles }
})