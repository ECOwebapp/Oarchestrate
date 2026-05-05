import { defineStore } from "pinia";
import { apiFetch } from "@/lib/api";
import { ref } from "vue";

export const useContactStore = defineStore("contact", () => {
  const emails = ref([]);
  const phone = ref([]);

  const fetchEmails = async () => {
    try {
      const response = await apiFetch(`/users_info/contact?type=${1}`, {
        method: "GET",
      });
      const result = await response.json();
      if (response.ok) emails.value = result.emails || [];
    } catch (e) {
      console.log("Error fetching emails: ", e);
    }
  };

  const fetchPhoneNumbers = async () => {
    try {
      const response = await apiFetch(`/users_info/contact?type=${2}`, {
        method: "GET",
      });
      const result = await response.json();
      if (response.ok) phone.value = result.phone_numbers || [];
    } catch (e) {
      console.log("Error fetching emails: ", e);
    }
  };

  const contactReset = () => {
    emails.value = phone.value = [];
  };

  return { emails, phone, fetchPhoneNumbers, fetchEmails, contactReset };
});
