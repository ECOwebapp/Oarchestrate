import { supabase } from '@/lib/supabaseClient'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { usePosStore } from './positions'
import { useAuthStore } from './useAuthStore'

// Position IDs
const POS_JUNIOR_DRAFTSMAN = 5
const POS_SENIOR_DRAFTSMAN = 6
const POS_ENGINEER = new Set([13, 14, 15, 16, 18, 19])
const POS_UNIT_HEAD = 4
const POS_DIRECTOR = 1
const PDU_UNIT_ID = 1

export const useDesignStore = defineStore('design', () => {
  const auth = useAuthStore()
  const posStore = usePosStore()
  const { memberPos } = storeToRefs(posStore)
  const plenary = ref([])

  const designSubtasks = ref([])
  const loading = ref(false)
  const nameMap = ref({})
  const pduMembers = ref([])

  const getPlenaryMembers = async() => {
    try{

      const { data, error } = await supabase.rpc('get_design_plenary')
      if(error) throw error
      plenary.value = data // IDs: (13, 14, 15, 16, 18, 19)

    } catch(e) {
      console.log('Failed to fetch plenary members: ', e)
    }
  }

  // ── Get PDU members filtered by role ──────────────────────────────────────
  const getPDUMembersByRole = async (roleId) => {
    try {
      const { data, error } = await supabase
        .from('position')
        .select('user_id, pos_id, unit_id')
        .eq('unit_id', PDU_UNIT_ID)
        .eq('pos_id', roleId)

      if (error) throw error
      return data || []
    } catch (err) {
      console.error(`[Design] Error fetching PDU members for role ${roleId}:`, err)
      return []
    }
  }

  // ── Fetch PDU members ────────────────────────────────────────────────────
  const fetchPDUMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('position')
        .select('user_id, pos_id, unit_id')
        .eq('unit_id', PDU_UNIT_ID)

      if (error) throw error
      pduMembers.value = data || []

      // Resolve names
      const userIds = [...new Set((data || []).map(p => p.user_id))]
      if (userIds.length > 0) await resolveNames(userIds)
    } catch (err) {
      console.error('[Design] Error fetching PDU members:', err)
    }
  }

  // ── Resolve names ────────────────────────────────────────────────────────
  const resolveNames = async (userIds) => {
    const missing = userIds.filter(id => id && !nameMap.value[id])
    if (!missing.length) return

    const { data, error } = await supabase
      .from('members')
      .select('user_id, fname, lname')
      .in('user_id', missing)

    if (error) {
      console.error('[Design] Error resolving names:', error)
      return
    }

    ;(data || []).forEach(p => {
      nameMap.value[p.user_id] = `${p.fname || ''} ${p.lname || ''}`.trim()
    })
  }

  // ── Get junior draftsmen in PDU ──────────────────────────────────────────
  const getJuniorDraftsmen = computed(() => {
    return pduMembers.value
      .filter(p => p.pos_id === POS_JUNIOR_DRAFTSMAN)
      .map(p => ({
        user_id: p.user_id,
        pos_id: p.pos_id,
        unit_id: p.unit_id,
        name: nameMap.value[p.user_id] || '—'
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
        name: nameMap.value[p.user_id] || '—'
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
        name: nameMap.value[p.user_id] || '—'
      }))
  })

  // ── Submit design task (assign to junior draftsman) ──────────────────────
  const submitDesignTask = async (subtaskId, juniorDraftsmanId) => {
    try {
      const { error } = await supabase
        .from('subtask')
        .update({
          assignee: juniorDraftsmanId
        })
        .eq('id', subtaskId)

      if (error) throw error

      // Create or update initial design approval record (using upsert to avoid duplicate key errors)
      const { error: approvalErr } = await supabase
        .from('design_approval')
        .upsert({
          id: subtaskId,
          engineers: false,
          senior_draftsman: false,
          unit_head: false,
          director: false
        }, {
          onConflict: 'id'
        })

      if (approvalErr) throw approvalErr
      return true
    } catch (err) {
      console.error('[Design] Error submitting design task:', err)
      throw err
    }
  }

  // ── Get design approval status ───────────────────────────────────────────
  const getDesignApprovalStatus = async (subtaskId) => {
    try {
      const { data, error } = await supabase
        .from('design_approval')
        .select('*')
        .eq('id', subtaskId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || {
        id: subtaskId,
        engineers: false,
        senior_draftsman: false,
        unit_head: false,
        director: false
      }
    } catch (err) {
      console.error('[Design] Error fetching approval status:', err)
      return null
    }
  }

  // ── Senior draftsman action (approve/revise) ─────────────────────────────
  const seniorDraftsmanAction = async (subtaskId, action, comment = '') => {
    try {
      const now = new Date().toISOString()
      const { error } = await supabase.rpc('design_senior_draftsman_action', {
        p_subtask_id: subtaskId,
        p_from_user: auth.userID,
        p_action: action, // 'approve' | 'revise'
        p_comment: comment,
        p_timestamp: now
      })

      if (error) throw error
      return true
    } catch (err) {
      console.error('[Design] Senior draftsman action failed:', err)
      throw err
    }
  }

  // ── Engineer action (approve/revise) ─────────────────────────────────────
  const engineerAction = async (subtaskId, action, role, comment = '') => {
    try {
      const now = new Date().toISOString()
      const { error } = await supabase.rpc('design_engineer_action', {
        p_subtask_id: subtaskId,
        p_from_user: auth.userID,
        p_action: action, // 'approve' | 'revise'
        p_role: role, // from among the ids within POS_ENGINEER
        p_comment: comment,
        p_timestamp: now
      })

      if (error) throw error
      return true
    } catch (err) {
      console.error('[Design] Engineer action failed:', err)
      throw err
    }
  }

  // ── Check if all engineers approved ──────────────────────────────────────
  const checkAllEngineersApproved = async (subtaskId) => {
    try {
      const { data, error } = await supabase.rpc(
        'check_all_engineers_approved',
        { p_subtask_id: subtaskId }
      )

      if (error) throw error
      return data || false
    } catch (err) {
      console.error('[Design] Error checking engineer approvals:', err)
      return false
    }
  }

  // ── Unit head action (approve/revise) ────────────────────────────────────
  const unitHeadAction = async (subtaskId, action, comment = '') => {
    try {
      const now = new Date().toISOString()
      const { error } = await supabase.rpc('design_unit_head_action', {
        p_subtask_id: subtaskId,
        p_from_user: auth.userID,
        p_action: action, // 'approve' | 'revise'
        p_comment: comment,
        p_timestamp: now
      })

      if (error) throw error
      return true
    } catch (err) {
      console.error('[Design] Unit head action failed:', err)
      throw err
    }
  }

  // ── Director action (approve/revise) ────────────────────────────────────
  const directorAction = async (subtaskId, action, comment = '') => {
    try {
      const now = new Date().toISOString()
      const { error } = await supabase.rpc('design_director_action', {
        p_subtask_id: subtaskId,
        p_from_user: auth.userID,
        p_action: action, // 'approve' | 'revise'
        p_comment: comment,
        p_timestamp: now
      })

      if (error) throw error
      return true
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
    nameMap,
    plenary,

    // Computed
    getJuniorDraftsmen,
    getSeniorDraftsmen,
    getEngineers,

    // Methods
    fetchPDUMembers,
    resolveNames,
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
