import { defineStore } from "pinia";
import { apiFetch, session } from "@/lib/api";
import { ref } from "vue";
import { useAuthStore } from "./useAuthStore";

export const useProjectStore = defineStore("ppa", () => {
  const projects = ref([]);
  const loading = ref(false);
  const auth = useAuthStore();

  const fetchProjects = async () => {
    try {
      loading.value = true;
      const response = await apiFetch("/ppa/fetch", { method: "GET" });
      const result = await response.json();

      if (response.ok) {
        projects.value = result.projects;
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      console.log("Error fetching PPAs: ", e);
    } finally {
      loading.value = false;
    }
  };

  const insertProjects = async ({ project }) => {
    try {
      if (!auth.isDirector) {
        console.log("Not authorised!");
        return;
      } else {
        const response = await apiFetch("/ppa/insert", {
          method: "POST",
          body: JSON.stringify({ ...project }),
        });

        return await response.text();
      }
    } catch (e) {
      console.log("Error adding PPAs: ", e);
    }
  };

  const updateProjects = async ({ project }) => {
    try {
      const response = await apiFetch("/ppa/update", {
        method: "POST",
        body: JSON.stringify({ ...project }),
      });
      return await response.text();
    } catch (e) {
      console.log("Error updating PPAs: ", e);
    }
  };

  const deleteProjects = async (id) => {
    try {
      const response = await apiFetch("/ppa/delete", {
        method: "POST",
        body: JSON.stringify({ id }),
      });

      return await response.text();
    } catch (e) {
      console.log("Error adding PPAs: ", e);
    }
  };

  const projectsReset = () => {
    projects.value = [];
  };

  return {
    projects,
    loading,
    fetchProjects,
    insertProjects,
    updateProjects,
    deleteProjects,
    projectsReset,
  };
});
