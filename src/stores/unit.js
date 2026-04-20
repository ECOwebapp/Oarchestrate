import { apiFetch } from '@/lib/api'
import { supabase } from '@/lib/supabaseClient'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUnitStore = defineStore('unit', () => {

    const unit = ref([])
    const posOnUnit = ref([])

    const fetchUnit = async() => {
        try {
            const response = await apiFetch('/office/fetch_unit', { method: 'GET' })
            const result = await response.json()

            if(response.ok) unit.value = (result.data || [])
        } catch(e) {
            console.log('Failed to fetch unit: ', e)
        }
    }

    const fetchUnitPeers = async(unitId) => {
        try {
            const response = await apiFetch(`/office/fetch_unit_peers?unitId=${unitId}`, { method: 'GET' })
            const result = await response.json()

            if(response.ok) posOnUnit.value = (result.data || [])
        } catch(e) {
            console.log('Error fetching peers: ', e)
        }
    }

    return { unit, posOnUnit, fetchUnit, fetchUnitPeers }
})