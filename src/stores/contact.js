import { defineStore } from "pinia";
import { useAuthStore } from "./useAuthStore";
import { supabase } from "@/lib/supabaseClient";
import { ref } from 'vue'

export const useContactStore = defineStore('contact', () => {
    const auth = useAuthStore()
    const emails = ref([])
    const phone = ref([])

    const fetchEmails = async () => {
        try {
            const { data, error } = await supabase
                .from('email')
                .select('user_id, email_address')

            if (error) throw error

            emails.value = (data || [])
        } catch (e) {
            console.log('Error fetching emails: ', e)
        }
    }

    const fetchPhoneNumbers = async () => {
        try {
            const { data, error } = await supabase
                .from('contact')
                .select('user_id, phone')

            if (error) throw error

            phone.value = (data || [])
        } catch (e) {
            console.log('Error fetching emails: ', e)
        }
    }

    return { emails, phone, fetchPhoneNumbers, fetchEmails }
})