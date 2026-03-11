import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUnitStore = defineStore('unit', () => {

    const unitPeers = ref([])

    const fetchUnitPeers = async() => {
        try {
            const { data: unitRows, error: unitErr } = await supabase
                .from('unit')
                .select('user_id, unit_name (id, name)')
    
            if (unitErr) throw unitErr
    
            unitPeers.value = (unitRows || [])
                .map(u => ({
                    user_id: u.user_id,
                    unit_id: u.unit_name?.id,
                    unit_name: u.unit_name?.name
                }))
        } catch(e) {
            console.log('Error fetching peers: ', e)
        }
    }

    return { unitPeers, fetchUnitPeers }
})