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

    const editUserEmail = async (payload) => {
        const userId = auth.user.id;

        try {
            // 1. Delete existing numbers for this user to "reset" the list
            const { error, status } = await supabase
                .from('email')
                .delete()
                .eq('user_id', userId);

            if (error) throw error

            // 2. Prepare the new rows (filtering out any empty strings)
            const newRows = payload
                .filter(email => email.trim() !== '')
                .map(email => ({
                    user_id: userId,
                    email_address: email.trim()
                }));

            if (newRows.length === 0) return status;
            else {
                const { status, error } = await supabase
                    .from('email')
                    .insert(newRows);

                if (error) throw error
                return status
            }

        } catch (e) {
            console.log('Error editing user email: ', e)
        }
    }

    // inside your contact service
    const editPhoneNumber = async (phoneArray) => {
        const userId = auth.user.id;

        try {
            // 1. Delete existing numbers for this user to "reset" the list
            const { error, status } = await supabase
                .from('contact')
                .delete()
                .eq('user_id', userId);

            if (error) throw error

            // 2. Prepare the new rows (filtering out any empty strings)
            const newRows = phoneArray
                .filter(num => num.trim() !== '')
                .map(num => ({
                    user_id: userId,
                    phone: num.trim()
                }));

            if (newRows.length === 0) return status;
            else {
                const { status, error } = await supabase
                    .from('contact')
                    .insert(newRows);

                if (error) throw error
                return status
            }
        } catch (e) {
            console.log('Error editing phone: ', e)
        }
    }

    return { emails, phone, fetchPhoneNumbers, fetchEmails, editUserEmail, editPhoneNumber }
})