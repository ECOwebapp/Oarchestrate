import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from '@/lib/supabaseClient'

export const usePosStore = defineStore('pos', () => {
    const position = ref([])
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

    const fetchMemberPos = async() => {
        try{
            const { data: posRows, error: posErr } = await supabase
                .from('position')
                .select('user_id, pos_id')

            if(posErr) throw posErr

            memberPos.value = (posRows || [])
                .map(p => ({
                    user_id: p.user_id,
                    pos_id: p.pos_id
                }))

        } catch (e){
            console.log('Error: ', e)
        }
    }

    const changeMemberPos = async({ member }) => {
        try {
            const { data: updateRow, error: updateErr, status } = await supabase
                .from('position')
                .update({pos_id: member?.pos_id})
                .eq('user_id', member?.user_id)
                .select()

            if (updateErr) throw updateErr
            if (status === 200) {
                await fetchMemberPos()

                return status
            }
        } catch (e) {
            console.log('Error: ', e)
        }
    }

    return { position, fetchPos, memberPos, fetchMemberPos, changeMemberPos }
})