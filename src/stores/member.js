import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from '@/lib/supabaseClient'

export const useMemberStore = defineStore('member', () => {

    const members = ref([])

    const fetchMembers = async () => {
        try {
            const { data: memberRows, error: memberErr } = await supabase
                .from('user_profile')
                .select(`
                    user_id, 
                    lname, 
                    fname, 
                    middle_initial, 
                    birthdate, 
                    gender_type (gender),
                    position ( 
                        pos_id,
                        position_name ( pos_name )
                      )
                `)

            if (memberErr) {
                throw memberErr
            } else {
                if (memberRows) {
                    members.value = (memberRows || [])
                        .map(m => ({
                            id: m.user_id,
                            lname: m.lname,
                            fname: m.fname,
                            middle_initial: m.middle_initial,
                            birthdate: m.birthdate,
                            gender: m.gender_type?.gender,
                            pos_id: m.position?.pos_id,
                            pos_name: m.position?.position_name?.pos_name
                        }))
                }
            }
            // console.log(memberRows[0])

        } catch(e) {
            console.log('Failed to fetch members: ', e)
        } finally {
            console.log(members)
        }
    }

    return { members, fetchMembers }
})