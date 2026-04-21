import { defineStore } from "pinia";
import { ref } from 'vue'
import { apiFetch } from "@/lib/api";

export const useGenderStore = defineStore('gender', () => {
    const gender = ref([])

    const fetchGender = async() => {
        try {
            const response = await apiFetch('/users_info/fetch_genders', { method: 'GET' })
            const result = await response.json()
            if(response.ok) gender.value = result.gender || []

        } catch(e) {
            console.log('Error fetching gender: ', e)
        }
    }

    return { gender, fetchGender }
})