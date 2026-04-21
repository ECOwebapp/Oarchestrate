import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { apiFetch } from '@/lib/api'

// Position IDs
const POS_JUNIOR_DRAFTSMAN = 5
const POS_SENIOR_DRAFTSMAN = 6
const POS_ENGINEER = new Set([13, 14, 15, 16, 18, 19])

export const useDesignStore = defineStore('design', () => {
  const plenary = ref([])

  const designSubtasks = ref([])
  const loading = ref(false)
  const pduMembers = ref([])

  const getPlenaryMembers = async () => {
    try {

      const response = await apiFetch('/design/plenary_members', { method: 'GET' })
      const result = await response.json()
      if (response.ok) plenary.value = result.plenary // IDs: (13, 14, 15, 16, 18, 19)

    } catch (e) {
      console.log('Failed to fetch plenary members: ', e)
    }
  }

  // ── Get PDU members filtered by role ──────────────────────────────────────
  const getPDUMembersByRole = async (roleId) => {
    try {
      const response = await apiFetch(`/design/pdu_members?roleId=${roleId}`)
      const result = await response.json()
      if (response.ok) return result.data || []
    } catch (err) {
      console.error(`[Design] Error fetching PDU members for role ${roleId}:`, err)
      return []
    }
  }

  // ── Fetch PDU members ────────────────────────────────────────────────────
  const fetchPDUMembers = async () => {
    try {
      const response = await apiFetch(`/design/pdu_members`)
      const result = await response.json()
      if (response.ok) pduMembers.value = result.data
    } catch (err) {
      console.error('[Design] Error fetching PDU members:', err)
    }
  }

  // ── Get junior draftsmen in PDU ──────────────────────────────────────────
  const getJuniorDraftsmen = computed(() => {
    return pduMembers.value
      .filter(p => p.pos_id === POS_JUNIOR_DRAFTSMAN)
      .map(p => ({
        user_id: p.user_id,
        pos_id: p.pos_id,
        unit_id: p.unit_id,
        name: p.user_name
      }))
  })

  // ── Get senior draftsmen in PDU ──────────────────────────────────────────
  const getSeniorDraftsmen = computed(() => {
    return pduMembers.value
      .filter(p => p.pos_id === POS_SENIOR_DRAFTSMAN)
      .map(p => ({
        user_id: p.user_id,
        pos_id: p.pos_id,
        unit_id: p.unit_id,
        name: p.user_name
      }))
  })

  // ── Get engineers in PDU ─────────────────────────────────────────────────
  const getEngineers = computed(() => {
    return pduMembers.value
      .filter(p => POS_ENGINEER.has(p.pos_id))
      .map(p => ({
        user_id: p.user_id,
        pos_id: p.pos_id,
        unit_id: p.unit_id,
        name: p.user_name
      }))
  })

  // ── Submit design task (assign to junior draftsman) ──────────────────────
  const submitDesignTask = async (subtaskId, juniorDraftsmanId) => {
    try {
      const response = await apiFetch('/design/submit', {
        method: 'POST',
        body: JSON.stringify({ subtaskId, juniorDraftsmanId })
      })
      const result = await response.json()
      if (response.ok) return true
    } catch (err) {
      console.error('[Design] Error submitting design task:', err)
      throw err
    }
  }

  // ── Get design approval status ───────────────────────────────────────────
  const getDesignApprovalStatus = async (subtaskId) => {
    try {
      const response = await apiFetch(`/design/design_approval_status?subtaskId=${subtaskId}`, { method: 'GET' })
      const result = await response.json()
      if (response.ok) return result.data
    } catch (err) {
      console.error('[Design] Error fetching approval status:', err)
      return null
    }
  }

  // ── Senior draftsman action (approve/revise) ─────────────────────────────
  const seniorDraftsmanAction = async (subtaskId, action, comment = '') => {
    try {
      const response = await apiFetch('/design/senior_draftsman_action', {
        method: 'POST',
        body: JSON.stringify({ subtaskId, action, comment })
      })
      if (response.ok) return true
    } catch (err) {
      console.error('[Design] Senior draftsman action failed:', err)
      throw err
    }
  }

  // ── Engineer action (approve/revise) ─────────────────────────────────────
  const engineerAction = async (subtaskId, action, role, comment = '') => {
    try {
      const response = await apiFetch('/design/engineer_action', {
        method: 'POST',
        body: JSON.stringify({ subtaskId, action, role, comment })
      })

      if (response.ok) return true
    } catch (err) {
      console.error('[Design] Engineer action failed:', err)
      throw err
    }
  }

  // ── Check if all engineers approved ──────────────────────────────────────
  const checkAllEngineersApproved = async (subtaskId) => {
    try {
      const response = await apiFetch(`/design/check_all_engineers_approval?subtaskId=${subtaskId}`,{
        method: 'GET'
      })
      const result = await response.json()
      if(response.ok) return result.data
    } catch (err) {
      console.error('[Design] Error checking engineer approvals:', err)
      return false
    }
  }

  // ── Unit head action (approve/revise) ────────────────────────────────────
  const unitHeadAction = async (subtaskId, action, comment = '') => {
    try {
      const response = await apiFetch('/design/unit_head_action', {
        method: 'POST',
        body: JSON.stringify({ subtaskId, action, comment })
      })
      if(response.ok) return true
    } catch (err) {
      console.error('[Design] Unit head action failed:', err)
      throw err
    }
  }

  // ── Director action (approve/revise) ────────────────────────────────────
  const directorAction = async (subtaskId, action, comment = '') => {
    try {
      const response = await apiFetch('/design/director_action', {
        method: 'POST',
        body: JSON.stringify({ subtaskId, action, comment })
      })
      if(response.ok) return true
    } catch (err) {
      console.error('[Design] Director action failed:', err)
      throw err
    }
  }

  return {
    // State
    designSubtasks,
    loading,
    pduMembers,
    plenary,

    // Computed
    getJuniorDraftsmen,
    getSeniorDraftsmen,
    getEngineers,

    // Methods
    fetchPDUMembers,
    getPDUMembersByRole,
    submitDesignTask,
    getDesignApprovalStatus,
    seniorDraftsmanAction,
    engineerAction,
    checkAllEngineersApproved,
    unitHeadAction,
    directorAction,
    getPlenaryMembers
  }
})
