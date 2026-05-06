import { defineStore, storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { apiFetch } from "@/lib/api";

export const useDashboardStore = defineStore("dashboard", () => {
  const tasks = ref([]);
  const dashboardData = ref({});
  const loading = ref(false);

  const fetchItems = async (selectedMonth, selectedYear, CIRC) => {
    try {
      loading.value = true;
      const response = await apiFetch("/dashboard/", {
        method: "POST",
        body: JSON.stringify({ selectedMonth, selectedYear, CIRC }),
      });

      const { rawData, rawItems } = await response.json();
      if (response.ok) {
        tasks.value = rawItems;
        dashboardData.value = rawData;
        return response.status;
      }
    } catch (e) {
      console.log("Error fetching dashboard tasks: ", e.message);
    } finally {
      loading.value = false;
    }
  };

  return { tasks, dashboardData, loading, fetchItems };
});
