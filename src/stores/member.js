import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from '@/lib/supabaseClient'

export const useMemberStore = defineStore('member', () => {

    const members = ref([])
    const loading = ref(false)

    const fetchMembers = async () => {
        try {
            loading.value = true
            const [resMembers, resProf, resStatus] = await Promise.all([
                supabase.from('members').select('*'),
                supabase.from('profession').select('user_id, profession_name:prof_id(prof_name)'),
                supabase.from('account_status').select('user_id, status_id')
            ])

            // 2. Catch any of the 3 errors immediately
            const err = resMembers.error || resProf.error || resStatus.error
            if (err) throw err

            const profMap = Object.fromEntries(resProf.data.map(p => [p.user_id, p.profession_name?.prof_name]))
            const statusMap = Object.fromEntries(resStatus.data.map(s => [s.user_id, s.status_id]))

            if (resMembers) {
                members.value = resMembers.data.map(m => ({
                    id: m.user_id,
                    lname: m.lname,
                    fname: m.fname,
                    middle_initial: m.middle_initial,
                    birthdate: m.birthdate,
                    contact: m.phone,
                    email: m.email_address,
                    gender: m.gender,
                    avatar_url: m.avatar_url,
                    // Instant lookups from our maps
                    profession: profMap[m.user_id]?.trim() || '',
                    status_id: statusMap[m.user_id]
                }))
            }
            // console.log(profRows)
            // console.log(members.value)

        } catch (e) {
            console.log('Failed to fetch members: ', e)
        } finally {
            loading.value = false
        }
    }

    const removeMember = async ({ member }) => {
        try {
            const { error, status } = await supabase.functions.invoke('delete-user', {
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

    return { loading, members, fetchMembers, removeMember }
})