import { defineStore } from "pinia";
import { ref } from "vue";
import { apiFetch } from "@/lib/api";

export const useAddressStore = defineStore("address", () => {
  const address = ref([]);
  const userAddress = ref([]);

  const fetchUserAddresses = async () => {
    try {
      const response = await apiFetch("/users_info/fetch_address", {
        method: "GET",
      });
      const result = await response.json();
      if (response.ok) address.value = result.data || [];
    } catch (e) {
      console.log("Failed to fetch address: ", e);
      throw new Error(e);
    }
  };

  const fetchUserAddress = async (userId) => {
    try {
      const response = await apiFetch(
        `/users_info/fetch_address?userId=${userId}`,
        { method: "GET" },
      );
      const result = await response.json();
      if (response.ok) userAddress.value = result.data || [];
    } catch (e) {
      console.log("Failed to fetch address: ", e);
      throw new Error(e);
    }
  };

  const addressReset = () => {
    address.value = userAddress.value = [];
  };

  return {
    address,
    userAddress,
    fetchUserAddresses,
    fetchUserAddress,
    addressReset,
  };
});
