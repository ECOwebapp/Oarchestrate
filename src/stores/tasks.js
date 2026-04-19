import { useAuthStore } from '@/stores/useAuthStore'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { apiFetch } from '@/lib/api'

export const taskStore = defineStore('tasks', () => {
  const tasks = ref([])
  const loading = ref(false)

  // ── FETCH TASKS ─────────────────────────────────────────────────────────────
  const fetchTasks = async (parentId = null) => {
    const auth = useAuthStore()
    const uid = auth.userID
    if (!uid) return
    loading.value = true

    try {
      const ppaId = parentId ? `?parentId=${parentId}` : ''
      const response = await apiFetch(`/tasks/fetch${ppaId}`, {
        method: 'GET'
      })

      const result = await response.json()
      if (response.ok) tasks.value = result
      else throw new Error(result.error)

    } catch (e) {
      console.error('[taskStore] fetchTasks:', e)
    } finally {
      loading.value = false
    }
  }

  // ── FETCH SINGLE TASK BY ID ─────────────────────────────────────────────────
  const fetchTaskById = async (taskId) => {
    try {
      const task = taskId ? `?taskId=${taskId}` : ''
      const response = await apiFetch(`/tasks/fetch${task}`, {
        method: 'GET'
      })

      const result = await response.json()
      if (response.ok) tasks.value = result
      else throw new Error(result.error)

    } catch (e) {
      console.error('[taskStore] fetchTasks:', e)
    }
  }

  // ── ADD TASK ────────────────────────────────────────────────────────────────
  const addTasks = async ({ mainTask }) => {
    try {
      const response = await apiFetch('/tasks/upsert', {
        method: 'POST',
        body: JSON.stringify({ mainTask })
      })

      const result = await response.json()
      if (response.ok) tasks.value = result
      else throw new Error(result.error)
      console.log(result)

    } catch (e) {
      console.log('Failed to add task: ', e)
    }
  }

  // ── APPROVE ─────────────────────────────────────────────────────────────────
  const approveTask = async (taskId, role, parentId) => {
    try {
      const response = await apiFetch('/tasks/approve', {
        method: 'POST',
        body: JSON.stringify({ taskId, role, parentId })
      })

      const result = await response.json()
      if (response.ok) tasks.value = result
      else throw new Error(result.error)
    } catch (err) {
      console.log('Failed to approve task: ', err.message)
    }
  }

  // ── RESUBMIT ────────────────────────────────────────────────────────────────
  const resubmitTask = async (taskId, newOutputLink, parentId) => {
    try {
      const response = await apiFetch('/tasks/resubmit', {
        method: 'POST',
        body: JSON.stringify({ taskId, newOutputLink, parentId })
      })

      const result = await response.json()
      if (response.ok) tasks.value = result
      else throw new Error(result.error)
    } catch (err) {
      console.log('Failed to resubmit task: ', err.message)
    }
  }

  // ── DELETE TASKS ────────────────────────────────────────────────────────────
  const deleteTasks = async (taskIds, parentId) => {
    try {
      const response = await apiFetch('/tasks/delete', {
        method: 'POST',
        body: JSON.stringify({ taskIds, parentId })
      })
      const result = await response.json()
      if (response.ok) tasks.value = result
      else throw new Error(result.error)
      console.log(result)

    } catch (err) {
      console.log('Error deleting tasks: ', err)
    }
  }

  // ── FETCH REVISIONS ─────────────────────────────────────────────────────────
  const fetchRevisions = async (taskId) => {
    try {
      const response = await apiFetch(`/tasks/fetch_revisions?taskId=${taskId}`, {
        method: 'GET'
      })
      if (response.ok) return await response.json()

    } catch (err) {
      console.log('Error deleting tasks: ', err)
    }
  }

  // ── REQUEST REVISION ────────────────────────────────────────────────────────
  const requestRevision = async (taskId, comment, role, parentId) => {
    try {
      const response = await apiFetch('/tasks/revision_request', {
        method: 'POST',
        body: JSON.stringify({ taskId, comment, role, parentId })
      })

      const result = await response.json()
      if (response.ok) tasks.value = result
      else throw new Error(result.error)
    } catch (err) {
      console.log('Failed to submit output: ', err.message)
    }
  }

  // ── SUBMIT OUTPUT ───────────────────────────────────────────────────────────
  const submitOutput = async (taskId, link) => {
    try {
      const response = await apiFetch('/output/insert', {
        method: 'POST',
        body: JSON.stringify({ taskId, link })
      })

      const result = await response.json()
      if (response.ok) tasks.value = result
      else throw new Error(result.error)
      console.log(result)
    } catch (err) {
      console.log('Failed to submit output: ', err.message)
    }
  }

  // ── EDIT OUTPUT ───────────────────────────────────────────────────────────────────────
  const editOutput = async (taskId, newLink) => {
    try {
      const response = await apiFetch('/output/update', {
        method: 'POST',
        body: JSON.stringify({ taskId, newLink })
      })

      const result = await response.json()
      if (response.ok) tasks.value = result
      else throw new Error(result.error)
      console.log(result)
    } catch (err) {
      console.log('Failed to submit output: ', err.message)
    }
  }

  // ── DELETE OUTPUT ───────────────────────────────────────────────────────────────────────
  const deleteOutput = async (taskId) => {
    try {
      const response = await apiFetch('/output/delete', {
        method: 'POST',
        body: JSON.stringify({ taskId })
      })

      const result = await response.json()
      if (response.ok) tasks.value = result
      else throw new Error(result.error)
      console.log(result)
    } catch (err) {
      console.log('Failed to submit output: ', err.message)
    }
  }

  return {
    tasks, loading,
    fetchTasks, addTasks, submitOutput,
    approveTask, requestRevision, resubmitTask, fetchRevisions, deleteTasks,
    fetchTaskById, editOutput, deleteOutput,
  }
})