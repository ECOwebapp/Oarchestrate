import { defineStore } from "pinia";
import { supabase } from "@/lib/supabaseClient";
import { ref } from 'vue'

export const useGenderStore = defineStore('gender', () => {
    const gender = ref([])

    const fetchGender = async() => {
        try {
            const { data, error } = await supabase
                .from('gender_type')
                .select('id, gender')
                .order('id')

            if(error) throw error

            gender.value = (data || [])
                .map(g => ({
                    id: g.id,
                    type: g.gender
                }))

        } catch(e) {
            console.log('Error fetching gender: ', e)
        }
    }

    return { gender, fetchGender }
})