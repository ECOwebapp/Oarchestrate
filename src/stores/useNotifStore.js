import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

export const useNotifStore = defineStore('notif', () => {

  const notifs  = ref([])
  const loading = ref(false)
  const PAGE    = 8
  const shown   = ref(PAGE)

  const unread  = computed(() => notifs.value.filter(n => !n.read).length)
  const visible = computed(() => notifs.value.slice(0, shown.value))
  const hasMore = computed(() => shown.value < notifs.value.length)

  const showMore    = () => { shown.value += PAGE }
  const resetShown  = () => { shown.value = PAGE }

  // ─────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────
  const fetchNotifs = async () => {
    const auth = useAuthStore()
    const uid  = auth.user?.id
    if (!uid) return

    // Wait until auth store finishes loading the profile
    if (auth.loading) {
      const unwatch = watch(() => auth.loading, (val) => {
        if (!val) { unwatch(); fetchNotifs() }
      })
      return
    }

    loading.value = true
    const results = []

    try {

      // ── 1. Registrations (director only) ────────────────
      // Schema: account_status.user_id → auth.users
      //         user_profile.user_id   → auth.users  (PK is user_id, NOT id)
      //         position.user_id, position.pos_id → position_name.id
      if (auth.isDirector) {
        const { data: regs, error: regsErr } = await supabase
          .from('account_status')
          .select('user_id, requested_at, status, notif_read_by_director')
          .eq('status', 'pending')
          .order('requested_at', { ascending: false })
          .limit(20)

        if (regsErr) {
          console.error('[notifStore] account_status fetch error:', regsErr)
        }

        const userIds = (regs || []).map(r => r.user_id)
        let nameMap = {}
        let posMap  = {}
        let unitMap = {}

        if (userIds.length) {
          const [profRes, posRes, unitRes] = await Promise.all([
            supabase.from('user_profile')
              .select('user_id, fname, lname')
              .in('user_id', userIds),
            supabase.from('position')
              .select('user_id, position_name:pos_id(pos_name)')
              .in('user_id', userIds),
            supabase.from('unit')
              .select('user_id, unit_name:unit_id(name)')
              .in('user_id', userIds),
          ])

          if (profRes.error) console.error('[notifStore] user_profile error:', profRes.error)
          if (posRes.error)  console.error('[notifStore] position error:',     posRes.error)
          if (unitRes.error) console.error('[notifStore] unit error:',         unitRes.error)

          nameMap = Object.fromEntries(
            (profRes.data || []).map(p => [p.user_id, `${p.fname || ''} ${p.lname || ''}`.trim()])
          )
          posMap = Object.fromEntries(
            (posRes.data || []).map(p => [p.user_id, p.position_name?.pos_name || ''])
          )
          unitMap = Object.fromEntries(
            (unitRes.data || []).map(u => [u.user_id, u.unit_name?.name || ''])
          )
        }

        ;(regs || []).forEach(r => {
          const unitLabel = unitMap[r.user_id] || ''
          results.push({
            id:       `reg-${r.user_id}`,
            type:     'registration',
            userId:   r.user_id,
            title:    nameMap[r.user_id] || 'New User',
            position: posMap[r.user_id]  || 'Unassigned',
            unit:     unitLabel,
            body:     `Registered${unitLabel ? ` under ${unitLabel}` : ''} — awaiting your approval.`,
            time:     r.requested_at,
            read:     !!r.notif_read_by_director,
            status:   'pending',
          })
        })
      }

      // ── 2. Task notifications ────────────────────────────
      // Build task query based on role:
      // Director   → tasks where unit_head=true and not yet director approved
      //              + Office unit tasks with output submitted
      // Unit Head  → tasks from their unit members with output submitted, not yet unit_head approved
      // Member     → their own tasks
      let taskRows = []
      let taskErr  = null

      if (auth.isDirector) {
        // Get Office unit id
        const { data: officeUnit } = await supabase
          .from('unit_name').select('id').ilike('name', 'office').maybeSingle()
        const officeUnitId = officeUnit?.id || null
        let officeFilter = null
        if (officeUnitId) {
          const { data: om } = await supabase
            .from('unit').select('user_id').eq('unit_id', officeUnitId)
          const officeIds = (om || []).map(m => m.user_id)
          if (officeIds.length) officeFilter = officeIds.map(id => `assignee.eq.${id}`).join(',')
        }

        const { data: d1, error: e1 } = await supabase
          .from('task')
          .select(`id, assignee, assigner,
            task_profile ( title, urgent, task_type_ref:task_type(task_type) ),
            task_approval ( unit_head, director ),
            task_duration ( created ),
            task_notif    ( read_by_assignee, read_by_director, read_by_unit_head ),
            task_output   ( link )`)
          .is('parent_id', null)
          .eq('task_approval.unit_head', true)
          .eq('task_approval.director', false)
          .limit(30)

        let d2 = []
        if (officeFilter) {
          const { data: od } = await supabase
            .from('task')
            .select(`id, assignee, assigner,
              task_profile ( title, urgent, task_type_ref:task_type(task_type) ),
              task_approval ( unit_head, director ),
              task_duration ( created ),
              task_notif    ( read_by_assignee, read_by_director, read_by_unit_head ),
              task_output   ( link )`)
            .is('parent_id', null).or(officeFilter)
          d2 = (od || []).filter(t => t.task_output?.link && !t.task_approval?.director)
        }
        const seen = new Set()
        taskRows = [...(d1||[]), ...d2].filter(t => {
          if (seen.has(t.id)) return false; seen.add(t.id); return true
        })
        taskErr = e1

      } else if (auth.isUnitHead) {
        // Unit head: tasks from unit members with output submitted, not yet approved
        const { data: unitMembers } = await supabase
          .from('unit').select('user_id').eq('unit_id', auth.unitId)
        const memberIds = (unitMembers || [])
          .map(m => m.user_id).filter(id => id !== uid)

        if (memberIds.length) {
          const filter = memberIds.map(id => `assignee.eq.${id}`).join(',')
          const { data: d, error: e } = await supabase
            .from('task')
            .select(`id, assignee, assigner,
              task_profile ( title, urgent, task_type_ref:task_type(task_type) ),
              task_approval ( unit_head, director ),
              task_duration ( created ),
              task_notif    ( read_by_assignee, read_by_director, read_by_unit_head ),
              task_output   ( link )`)
            .is('parent_id', null).or(filter).limit(30)
          taskRows = (d || []).filter(t => t.task_output?.link && !t.task_approval?.unit_head)
          taskErr  = e
        }

      } else {
        const { data: d, error: e } = await supabase
          .from('task')
          .select(`id, assignee, assigner,
            task_profile ( title, urgent, task_type_ref:task_type(task_type) ),
            task_approval ( unit_head, director ),
            task_duration ( created ),
            task_notif    ( read_by_assignee, read_by_director, read_by_unit_head )`)
          .or(`assignee.eq.${uid},assigner.eq.${uid}`)
          .is('parent_id', null).limit(30)
        taskRows = d || []
        taskErr  = e
      }

      if (taskErr) console.error('[notifStore] task fetch error:', taskErr)

      const uids2 = [...new Set((taskRows || [])
        .flatMap(t => [t.assigner, t.assignee]).filter(Boolean))]
      let nm2 = {}
      if (uids2.length) {
        const { data: p2 } = await supabase
          .from('user_profile').select('user_id, fname, lname').in('user_id', uids2)
        nm2 = Object.fromEntries(
          (p2 || []).map(p => [p.user_id, `${p.fname || ''} ${p.lname || ''}`.trim()])
        )
      }

      ;(taskRows || []).forEach(t => {
        const urgent   = !!t.task_profile?.urgent
        const taskType = t.task_profile?.task_type_ref?.task_type?.toLowerCase() || 'regular'
        let isRead = false
        if (auth.isDirector)  isRead = !!t.task_notif?.read_by_director
        else if (auth.isUnitHead) isRead = !!t.task_notif?.read_by_unit_head
        else isRead = !!t.task_notif?.read_by_assignee

        // For members: only show their own pending tasks
        if (!auth.isDirector && !auth.isUnitHead) {
          if (t.assignee !== uid) return
        }

        const submitter = nm2[t.assignee] || 'Someone'
        const assigner  = nm2[t.assigner] || 'Unknown'
        results.push({
          id:    `task-${t.id}`,
          type:  'task_submitted',
          title: t.task_profile?.title || 'Untitled Task',
          body:  auth.isUnitHead
            ? `${submitter} submitted output — awaiting your review · ${taskType}${urgent ? ' · URGENT' : ''}`
            : auth.isDirector
              ? `${submitter} · ${taskType}${urgent ? ' · URGENT' : ''} · approved by Unit Head`
              : `Assigned by ${assigner} · ${taskType}${urgent ? ' · URGENT' : ''}`,
          time:  t.task_duration?.created,
          read:  isRead,
          meta:  { urgent, taskType },
        })
      })

      // ── 3. Pokes ─────────────────────────────────────────
      const { data: pokes, error: pokeErr } = await supabase
        .from('task_poke')
        .select(`
          id, task_id, from_user, message, created_at, is_read,
          task:task_id ( task_profile(title) )
        `)
        .eq('to_user', uid)
        .order('created_at', { ascending: false })
        .limit(20)

      if (pokeErr) console.error('[notifStore] task_poke error:', pokeErr)

      const pokerIds = [...new Set((pokes || []).map(p => p.from_user).filter(Boolean))]
      let pokerMap = {}
      if (pokerIds.length) {
        const { data: pp } = await supabase
          .from('user_profile')
          .select('user_id, fname, lname')
          .in('user_id', pokerIds)
        pokerMap = Object.fromEntries(
          (pp || []).map(p => [p.user_id, `${p.fname || ''} ${p.lname || ''}`.trim()])
        )
      }

      ;(pokes || []).forEach(p => {
        results.push({
          id:    `poke-${p.id}`,
          type:  'poke',
          title: pokerMap[p.from_user] || 'A team member',
          body:  p.message || `Followed up on "${p.task?.task_profile?.title || 'a task'}"`,
          time:  p.created_at,
          read:  !!p.is_read,
          meta:  { taskId: p.task_id },
        })
      })

    } catch (e) {
      console.error('[notifStore] fetchNotifs error:', e)
    } finally {
      loading.value = false
    }

    results.sort((a, b) => new Date(b.time) - new Date(a.time))
    notifs.value = results
  }

  // ─────────────────────────────────────────
  // MARK ALL READ
  // ─────────────────────────────────────────
  const markAllRead = async () => {
    // Mark non-registration notifs as read locally
    notifs.value.forEach(n => {
      if (n.type !== 'registration') n.read = true
    })
    const auth = useAuthStore()
    const uid  = auth.user?.id
    if (!uid) return

    try {
      // Do NOT mass-mark registrations as read here —
      // they are individually marked read only when approved/denied
      if (false) { /* intentionally skip account_status mass-read */ }
      const taskIds = notifs.value
        .filter(n => n.type === 'task_submitted')
        .map(n => parseInt(n.id.replace('task-', '')))
      if (taskIds.length) {
        const col = auth.isDirector
          ? 'read_by_director'
          : auth.isUnitHead
            ? 'read_by_unit_head'
            : 'read_by_assignee'
        await supabase.from('task_notif').update({ [col]: true }).in('task_id', taskIds)
      }
      const pokeIds = notifs.value
        .filter(n => n.type === 'poke')
        .map(n => parseInt(n.id.replace('poke-', '')))
      if (pokeIds.length) {
        await supabase.from('task_poke').update({ is_read: true }).in('id', pokeIds)
      }
    } catch (e) {
      console.error('[notifStore] markAllRead error:', e)
    }
  }

  // ─────────────────────────────────────────
  // APPROVE / DENY
  // ─────────────────────────────────────────
  const approveUser = async (userId) => {
    const auth = useAuthStore()
    const n = notifs.value.find(n => n.id === `reg-${userId}`)
    if (n) n.status = 'approving'
    try {
      const { error } = await supabase
        .from('account_status')
        .update({
          status:                 'approved',
          notif_read_by_director: true,
          reviewed_by:            auth.user?.id,
          reviewed_at:            new Date().toISOString(),
        })
        .eq('user_id', userId)
      if (error) throw error
      notifs.value = notifs.value.filter(n => n.id !== `reg-${userId}`)
    } catch (e) {
      console.error('[notifStore] approveUser error:', e)
      if (n) n.status = 'pending'
    }
  }

  const denyUser = async (userId) => {
    const auth = useAuthStore()
    const n = notifs.value.find(n => n.id === `reg-${userId}`)
    if (n) n.status = 'denying'
    try {
      const { error } = await supabase
        .from('account_status')
        .update({
          status:                 'denied',
          notif_read_by_director: true,
          reviewed_by:            auth.user?.id,
          reviewed_at:            new Date().toISOString(),
        })
        .eq('user_id', userId)
      if (error) throw error
      notifs.value = notifs.value.filter(n => n.id !== `reg-${userId}`)
    } catch (e) {
      console.error('[notifStore] denyUser error:', e)
      if (n) n.status = 'pending'
    }
  }

  // ─────────────────────────────────────────
  // REALTIME
  // ─────────────────────────────────────────
  let channel = null
  const setupRealtime = (onNew) => {
    channel = supabase
      .channel('notif-feed')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'account_status' },
        () => { fetchNotifs(); onNew?.() }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task' },
        () => { fetchNotifs(); onNew?.() }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task_poke' },
        () => { fetchNotifs(); onNew?.() }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task_revision' },
        (payload) => {
          const auth = useAuthStore()
          // Only notify if current user is the recipient
          if (payload.new?.to_user === auth.user?.id) {
            fetchNotifs(); onNew?.()
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'task_approval' },
        () => { fetchNotifs(); onNew?.() }
      )
      .subscribe()
  }
  const teardownRealtime = () => { channel?.unsubscribe(); channel = null }

  return {
    notifs, loading, shown, unread, visible, hasMore,
    showMore, resetShown,
    fetchNotifs, markAllRead,
    approveUser, denyUser,
    setupRealtime, teardownRealtime,
  }
})