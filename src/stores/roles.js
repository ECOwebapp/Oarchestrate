import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from '@/lib/supabaseClient'

export const useRolePosStore = defineStore('rolePos', () => {
    const roles = ref([])
    const memberRoles = ref([])

    const fetchRoles = async () => {

        try {
            const { data: roleRows, error: roleErr } = await supabase
                .from('role_type')
                .select('id, role_type')

            if (roleErr) throw roleErr

            roles.value = (roleRows || [])
                .filter(r => r.role_type !== 'Admin' )
                .map(r => ({
                    id: r.id,
                    name: r.role_type
                }))

        } catch (e) {
            console.log(`Error: ${e}`)
        }
    }

    const fetchMemberRoles = async() => {
        try{
            const { data: posRows, error: posErr } = await supabase
                .from('member_type')
                .select('user_id, role_id')

            if(posErr) throw posErr

            memberRoles.value = (posRows || [])
                .map(p => ({
                    user_id: p.user_id,
                    role_id: p.role_id
                }))

        } catch (e){
            console.log('Error: ', e)
        }
    }

    return { roles, memberRoles, fetchRoles, fetchMemberRoles }
})