import { supabase } from '@/lib/supabaseClient'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUnitStore = defineStore('unit', () => {

    const unit = ref([])

    const fetchUnitPeers = async(unitId) => {
        try {
            const { data, error } = await supabase.rpc('get_unit_position', { 
                target_unit_id: unitId 
              });
    
            if (error) throw error
    
            unit.value = data
        } catch(e) {
            console.log('Error fetching peers: ', e)
        }
    }

    return { unit, fetchUnitPeers }
})