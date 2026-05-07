import { useAuthStore } from "@/stores/useAuthStore";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { apiFetch } from "@/lib/api";

const OFFICE_UNIT_ID = 3;

export const useSubtaskStore = defineStore("subtasks", () => {
  const subtasks = ref([]);
  const loading = ref(false);

  // ── FETCH SUBTASKS ─────────────────────────────────────────────────────────────
  const fetchSubTasks = async (parentTaskId = null, design = false) => {
    const auth = useAuthStore();
    const uid = auth.userID;
    if (!uid) return;
    loading.value = true;

    try {
      const param = parentTaskId
        ? `?parentId=${parentTaskId}`
        : design
          ? `?design=${design}`
          : "";
      const response = await apiFetch(`/subtasks/fetch${param}`, {
        method: "GET",
      });

      const result = await response.json();
      if (response.ok) subtasks.value = result;
      else throw new Error(result.error);
    } catch (e) {
      console.error("[taskStore] fetchSubTasks:", e);
    } finally {
      loading.value = false;
      console.log(subtasks.value);
    }
  };

  const fetchSubtaskById = async (subtaskId) => {
    try {
      const id = subtaskId ? `?subtaskId=${subtaskId}` : "";
      const response = await apiFetch(`/subtasks/fetch${id}`, {
        method: "GET",
      });

      const result = await response.json();
      if (response.ok) return result;
      else throw new Error(result.error);
    } catch (e) {
      console.error("[taskStore] fetchSubTasks:", e);
    } finally {
      loading.value = false;
    }
  };

  // ── ADD TASK ────────────────────────────────────────────────────────────────
  const addSubTasks = async ({ subTask }) => {
    try {
      const response = await apiFetch("/subtasks/upsert", {
        method: "POST",
        body: JSON.stringify({ subTask }),
      });

      const result = await response.json();
      if (response.ok) subtasks.value = result;
      else throw new Error(result.error);
      console.log(result);
    } catch (e) {
      console.log("Failed to add subtask: ", e);
    }
  };

  // ── APPROVE ─────────────────────────────────────────────────────────────────
  const approveSubTask = async (subtaskId, role, parentId) => {
    try {
      const response = await apiFetch("/subtasks/approve", {
        method: "POST",
        body: JSON.stringify({ subtaskId, role, parentId }),
      });

      const result = await response.json();
      if (response.ok) subtasks.value = result;
      else throw new Error(result.error);
    } catch (err) {
      console.log("Failed to approve subtasks: ", err.message);
    }
  };

  // ── RESUBMIT ────────────────────────────────────────────────────────────────
  const resubmitTask = async (subtaskId, newOutputLink, parentId) => {
    try {
      const response = await apiFetch("/subtasks/resubmit", {
        method: "POST",
        body: JSON.stringify({ subtaskId, newOutputLink, parentId }),
      });

      const result = await response.json();
      if (response.ok) subtasks.value = result;
      else throw new Error(result.error);
    } catch (err) {
      console.log("Failed to resubmit task: ", err.message);
    }
  };

  // ── DELETE TASKS ────────────────────────────────────────────────────────────
  const deleteSubTasks = async (subtaskIds, parentId) => {
    try {
      const response = await apiFetch("/subtasks/delete", {
        method: "POST",
        body: JSON.stringify({ subtaskIds, parentId }),
      });
      const result = await response.json();
      if (response.ok) subtasks.value = result;
      else throw new Error(result.error);
      console.log(result);
    } catch (err) {
      console.log("Error deleting tasks: ", err);
    }
  };

  // ── FETCH REVISIONS ─────────────────────────────────────────────────────────
  const fetchRevisions = async (subtaskId) => {
    try {
      const response = await apiFetch(
        `/subtasks/fetch_revisions?subtaskId=${subtaskId}`,
        {
          method: "GET",
        },
      );
      const result = await response.json();
      if (response.ok) return result;
    } catch (err) {
      console.log("Error deleting tasks: ", err);
    }
  };

  // ── REQUEST REVISION ────────────────────────────────────────────────────────
  const requestRevision = async (subtaskId, comment, role, parentId) => {
    try {
      const response = await apiFetch("/subtasks/revision_request", {
        method: "POST",
        body: JSON.stringify({ subtaskId, comment, role, parentId }),
      });

      const result = await response.json();
      if (response.ok) subtasks.value = result;
      else throw new Error(result.error);
    } catch (err) {
      console.log("Failed to submit output: ", err.message);
    }
  };

  // ── SUBMIT OUTPUT ───────────────────────────────────────────────────────────
  const submitOutput = async (subtaskId, link) => {
    try {
      const response = await apiFetch("/output/insert", {
        method: "POST",
        body: JSON.stringify({ subtaskId, link }),
      });

      const result = await response.json();
      console.log(result);
    } catch (err) {
      console.log("Failed to submit output: ", err.message);
    }
  };

  // ── EDIT OUTPUT ───────────────────────────────────────────────────────────────────────
  const editOutput = async (subtaskId, newLink) => {
    try {
      const response = await apiFetch("/output/update", {
        method: "POST",
        body: JSON.stringify({ subtaskId, newLink }),
      });

      const result = await response.json();
      console.log(result);
    } catch (err) {
      console.log("Failed to submit output: ", err.message);
    }
  };

  // ── DELETE OUTPUT ───────────────────────────────────────────────────────────────────────
  const deleteOutput = async (subtaskId) => {
    try {
      const response = await apiFetch("/output/delete", {
        method: "POST",
        body: JSON.stringify({ subtaskId }),
      });

      const result = await response.json();
      console.log(result);
    } catch (err) {
      console.log("Failed to submit output: ", err.message);
    }
  };

  const subtaskReset = () => {
    subtasks.value = [];
  };

  return {
    subtasks,
    loading,
    fetchSubTasks,
    addSubTasks,
    submitOutput,
    approveSubTask,
    requestRevision,
    resubmitTask,
    fetchRevisions,
    deleteSubTasks,
    fetchSubtaskById,
    subtaskReset,
    editOutput,
    deleteOutput,
  };
});
