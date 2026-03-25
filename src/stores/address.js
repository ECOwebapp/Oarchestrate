import { defineStore } from "pinia";
import { supabase } from "@/lib/supabaseClient";
import { ref } from 'vue'
import { useAuthStore } from "./useAuthStore";

export const useAddressStore = defineStore('address', () => {
    const auth = useAuthStore()
    const address = ref([])
    const userAddress = ref([])

    const fetchUserAddresses = async() => {
        try {
            const { data, error } = await supabase 
                .from('address')
                .select('*')

                if(error) throw error
                address.value = (data || [])
        } catch(e) {
            console.log('Failed to fetch address: ', e)
        }
    }

    const fetchUserAddress = async(userId) => {
        try {
            const { data, error } = await supabase 
                .from('address')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle()

                if(error) throw error
                userAddress.value = (data || [])
        } catch(e) {
            console.log('Failed to fetch address: ', e)
        }
    }

    const changeUserAddress = async(payload) => {
        try {
            const { data, error, status } = await supabase
                .from('address')
                .update(payload)
                .eq('user_id', auth.userID)

            if(error) throw error
            return status
        } catch(e) {
            console.log('Error editing address: ', e)
        }
    }

    return { address, userAddress, fetchUserAddresses, fetchUserAddress, changeUserAddress }
})