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

            const { data: statusRows, error: statusErr } = await supabase
                .from('account_status')
                .select(`user_id, status_id`)

            if (memberErr) {
                throw memberErr
            } else if (statusErr) {
                throw statusErr
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
                            pos_name: m.position?.position_name?.pos_name,
                            status_id: statusRows.find(s => s.user_id === m.user_id)?.status_id
                        }))
                }
            }
            // console.log(memberRows[0])

        } catch (e) {
            console.log('Failed to fetch members: ', e)
        } finally {
            console.log(members)
        }
    }

    const removeMember = async ({ member }) => {
        try {
            const { data, error, status } = await supabase.functions.invoke('delete-user', {
                body: { userId: member.user_id }
            })

            if (error) throw error
            if (status === 200) {
                await fetchMembers()

                return status
            }
        } catch (e) {
            console.log('Error removing: ', e)
        }
    }

    return { members, fetchMembers, removeMember }
})