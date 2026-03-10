// stores/tasks.js
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const taskStore = defineStore('tasks', () => {
  const tasks   = ref([])
  const loading = ref(false)
  const nameMap = ref({})
  const unitMembers = ref([])

  // ── Name resolver ───────────────────────────────────────
  const resolveNames = async (uids) => {
    const missing = uids.filter(id => id && !nameMap.value[id])
    if (!missing.length) return
    const { data } = await supabase
      .from('user_profile')
      .select('user_id, fname, lname')
      .in('user_id', missing)
    ;(data || []).forEach(p => {
      nameMap.value[p.user_id] = `${p.fname || ''} ${p.lname || ''}`.trim()
    })
  }

  const TASK_SELECT = `
    id, parent_id, assigner, assignee, design,
    task_profile ( title, description, urgent, revision, task_type,
      task_type_ref:task_type(task_type) ),
    task_approval ( unit_head, director, revision_comment, revised_at ),
    task_duration ( created, deadline ),
    task_output   ( link ),
    subtasks:task!parent_id (
      id, assignee,
      task_profile ( title, description, urgent ),
      task_approval ( unit_head, director ),
      task_output   ( link )
    )
  `

  const mapRow = (t) => ({
    id:             t.id,
    parentId:       t.parent_id,
    assigner:       t.assigner,
    assignee:       t.assignee,
    assignerName:   nameMap.value[t.assigner] || '—',
    assigneeName:   nameMap.value[t.assignee] || '—',
    name:           t.task_profile?.title        || '',
    description:    t.task_profile?.description  || '',
    urgent:         !!t.task_profile?.urgent,
    revision:       !!t.task_profile?.revision,
    type:           t.task_profile?.task_type_ref?.task_type || '',
    typeId:         t.task_profile?.task_type    || null,
    from:           t.task_duration?.created     || null,
    to:             t.task_duration?.deadline    || null,
    startDate:      t.task_duration?.created     || null,
    endDate:        t.task_duration?.deadline    || null,
    outputLink:     t.task_output?.link ?? '',
    unitHead:       !!t.task_approval?.unit_head,
    director:       !!t.task_approval?.director,
    revisionComment: t.task_approval?.revision_comment || '',
    revisedAt:      t.task_approval?.revised_at  || null,
    design:         !!t.design,
    subtasks: (t.subtasks || []).map(s => ({
      id:          s.id,
      name:        s.task_profile?.title       || '',
      description: s.task_profile?.description || '',
      urgent:      !!s.task_profile?.urgent,
      unitHead:    !!s.task_approval?.unit_head,
      director:    !!s.task_approval?.director,
      outputLink:  s.task_output?.link ?? '',
      assignee:    s.assignee,
    })),
  })

  // ── FETCH UNIT MEMBERS ──────────────────────────────────
  const fetchUnitMembers = async () => {
    const auth = useAuthStore()
    if (!auth.isUnitHead || !auth.unitId) return

    try {
      // Get all users in the same unit
      const { data: unitUsers, error: unitError } = await supabase
        .from('unit')
        .select('user_id')
        .eq('unit_id', auth.unitId)

      if (unitError) {
        console.error('[taskStore] fetchUnitMembers - unit query:', unitError)
        return
      }

      if (unitUsers && unitUsers.length > 0) {
        const userIds = unitUsers.map(u => u.user_id)

        // Get user profiles and roles
        const [profileRes, roleRes] = await Promise.all([
          supabase
            .from('user_profile')
            .select('user_id, fname, lname, middle_initial')
            .in('user_id', userIds),
          supabase
            .from('member_type')
            .select('user_id, role_id')
            .in('user_id', userIds)
        ])

        if (profileRes.error) console.error('[taskStore] fetchUnitMembers - profile query:', profileRes.error)
        if (roleRes.error) console.error('[taskStore] fetchUnitMembers - role query:', roleRes.error)

        // Create maps for easy lookup
        const profileMap = {}
        const roleMap = {}

        ;(profileRes.data || []).forEach(p => {
          profileMap[p.user_id] = p
        })

        ;(roleRes.data || []).forEach(r => {
          roleMap[r.user_id] = r.role_id
        })

        // Resolve names and map member details
        await resolveNames(userIds)

        unitMembers.value = userIds.map(userId => {
          const profile = profileMap[userId]
          const roleId = roleMap[userId]

          return {
            id: userId,
            name: nameMap.value[userId] || 'Unknown',
            roleId: roleId || null,
            roleType: roleId === 1 ? 'Director' :
                     roleId === 2 ? 'Unit Head' :
                     roleId === 3 ? 'Member' : 'Unknown',
            isCurrentUser: userId === auth.userID
          }
        })
      }
    } catch (e) {
      console.error('[taskStore] fetchUnitMembers:', e)
    }
  }

  // ── FETCH ───────────────────────────────────────────────
  const fetchTasks = async () => {
    const auth = useAuthStore()
    const uid  = auth.user?.id
    if (!uid) return
    loading.value = true
    try {

      if (auth.isDirector) {
        // Director sees:
        // 1. Tasks approved by unit head (unitHead=true, director=false)
        // 2. Tasks from Office unit members (direct-to-director) with output submitted
        // 3. Own assigned tasks
        const { data: officeUnit } = await supabase
          .from('unit_name')
          .select('id')
          .ilike('name', 'office')
          .maybeSingle()

        const officeUnitId = officeUnit?.id || null

        let officeMembers = []
        if (officeUnitId) {
          const { data: om } = await supabase
            .from('unit').select('user_id').eq('unit_id', officeUnitId)
          officeMembers = (om || []).map(m => m.user_id)
        }

        // Tasks approved by unit heads (regular pipeline)
        const { data: approvedRows } = await supabase
          .from('task')
          .select(TASK_SELECT)
          .is('parent_id', null)
          .eq('task_approval.unit_head', true)
          .eq('task_approval.director', false)

        // Tasks from Office unit (bypass unit head), with output submitted
        let officeRows = []
        if (officeMembers.length) {
          const filter = officeMembers.map(id => `assignee.eq.${id}`).join(',')
          const { data: or_ } = await supabase
            .from('task').select(TASK_SELECT)
            .is('parent_id', null)
            .or(filter)
          // Only include if output submitted and not yet director-approved
          officeRows = (or_ || []).filter(t =>
            t.task_output?.link && !t.task_approval?.director
          )
        }

        // Director's own assigned tasks
        const { data: myRows } = await supabase
          .from('task').select(TASK_SELECT)
          .is('parent_id', null).eq('assigner', uid)

        const seen = new Set()
        const rows = [...(approvedRows||[]), ...officeRows, ...(myRows||[])]
          .filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true })
        await resolveNames([...new Set(rows.flatMap(t => [t.assigner, t.assignee]).filter(Boolean))])
        tasks.value = rows.map(mapRow)

      } else if (auth.isUnitHead) {
        // Unit head sees only their own unit's tasks (not Office)
        const { data: unitMembers } = await supabase
          .from('unit')
          .select('user_id')
          .eq('unit_id', auth.unitId)

        const memberIds = (unitMembers || []).map(m => m.user_id).filter(id => id !== uid)
        const assigneeFilter = [uid, ...memberIds].map(id => `assignee.eq.${id}`).join(',')
        const { data: rows } = await supabase
          .from('task').select(TASK_SELECT)
          .is('parent_id', null).or(assigneeFilter)
        await resolveNames([...new Set((rows||[]).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))])
        // also fetch roles of assignees so we know who is a member vs head
        const assigneeIds = [...new Set((rows||[]).map(t => t.assignee).filter(Boolean))]
        let roleMap = {}
        if (assigneeIds.length) {
          const { data: roles } = await supabase
            .from('member_type')
            .select('user_id, role_id')
            .in('user_id', assigneeIds)
          ;(roles || []).forEach(r => { roleMap[r.user_id] = r.role_id })
        }
        tasks.value = (rows||[]).map(t => ({
          ...mapRow(t),
          assigneeRole: roleMap[t.assignee] || null,
        }))

        // Fetch unit members for display
        await fetchUnitMembers()

      } else {
        // Member: own tasks only
        const { data: rows } = await supabase
          .from('task').select(TASK_SELECT)
          .is('parent_id', null).eq('assignee', uid)
        await resolveNames([...new Set((rows||[]).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))])
        tasks.value = (rows||[]).map(mapRow)
      }

    } catch(e) {
      console.error('[taskStore] fetchTasks:', e)
    } finally {
      loading.value = false
    }
  }

  // ── ADD TASK ────────────────────────────────────────────
  const addTasks = async ({ mainTask, subTasks = [] }) => {
    const auth = useAuthStore()
    const uid  = auth.user?.id
    const assigneeId = auth.isMember ? uid : mainTask.assignee

    const { data: taskRow, error: taskErr } = await supabase
      .from('task')
      .insert({ assigner: uid, assignee: assigneeId, design: !!mainTask.design })
      .select('id').single()
    if (taskErr) throw taskErr
    const taskId = taskRow.id

    // Determine approval status based on role and assignee
    // Director self-assigned tasks are automatically approved
    const isDirectorSelfAssigned = auth.isDirector && assigneeId === uid
    
    // For member self-assigned tasks with output: mark unit_head=true so director sees it immediately
    const memberHasOutput = !!mainTask.outputLink && auth.isMember

    await Promise.all([
      supabase.from('task_profile').insert({
        id: taskId, title: mainTask.name, description: mainTask.description,
        task_type: mainTask.type, urgent: !!mainTask.urgent, revision: false,
      }),
      supabase.from('task_approval').insert({
        id:        taskId,
        unit_head: isDirectorSelfAssigned ? true : memberHasOutput,
        director:  isDirectorSelfAssigned ? true : false,
      }),
      supabase.from('task_duration').insert({
        id: taskId, created: new Date().toISOString().split('T')[0], deadline: mainTask.endDate,
      }),
      supabase.from('task_output').insert({ id: taskId, link: mainTask.outputLink || '' }),
    ])

    for (const sub of (subTasks || []).filter(s => s.description?.trim())) {
      const { data: subRow } = await supabase
        .from('task').insert({ assigner: uid, assignee: assigneeId, parent_id: taskId })
        .select('id').single()
      if (!subRow) continue
      await Promise.all([
        supabase.from('task_profile').insert({ id: subRow.id, title: sub.description, description: sub.description, task_type: mainTask.type, urgent: false }),
        supabase.from('task_approval').insert({ id: subRow.id, unit_head: false, director: false }),
        supabase.from('task_duration').insert({ id: subRow.id, created: new Date().toISOString().split('T')[0], deadline: mainTask.endDate }),
        supabase.from('task_output').insert({ id: subRow.id, link: '' }),
      ])
    }
    await fetchTasks()
  }

  // ── SUBMIT OUTPUT ───────────────────────────────────────
  const submitOutput = async (taskId, link) => {
    const auth = useAuthStore()

    // Upsert the output link
    const { data: updated, error: updErr } = await supabase
      .from('task_output')
      .update({ link })
      .eq('id', taskId)
      .select('id')
    if (updErr) throw new Error(updErr.message)

    if (!updated || updated.length === 0) {
      const { error: insErr } = await supabase
        .from('task_output')
        .insert({ id: taskId, link })
      if (insErr) throw new Error(insErr.message)
    }

    // ── Notify the right reviewer ──
    // Office unit → notify director directly
    // All other units → notify their unit head
    if (auth.isOffice) {
      // Mark task_notif so director sees it
      await supabase.from('task_notif')
        .upsert({ task_id: taskId, read_by_director: false, read_by_assignee: false, read_by_unit_head: false },
          { onConflict: 'task_id' })
    } else {
      // Find the unit head of the same unit as assignee
      const { data: taskRow } = await supabase
        .from('task').select('assignee').eq('id', taskId).maybeSingle()
      if (taskRow?.assignee) {
        const { data: assigneeUnit } = await supabase
          .from('unit').select('unit_id').eq('user_id', taskRow.assignee).maybeSingle()
        if (assigneeUnit?.unit_id) {
          // Insert task_revision message to unit head
          const { data: unitHeads } = await supabase
            .from('unit').select('user_id')
            .eq('unit_id', assigneeUnit.unit_id)
          // Find which of those is a unit head (role_id = 2)
          if (unitHeads?.length) {
            const uhIds = unitHeads.map(u => u.user_id)
            const { data: uhMembers } = await supabase
              .from('member_type').select('user_id')
              .eq('role_id', 2).in('user_id', uhIds)
            for (const uh of (uhMembers || [])) {
              await supabase.from('task_revision').insert({
                task_id:   taskId,
                from_user: auth.user.id,
                to_user:   uh.user_id,
                role:      'unit_head',
                comment:   '📎 Output submitted — awaiting your review.',
                is_read:   false,
              })
            }
          }
        }
      }
      // Mark task_notif for unit head
      await supabase.from('task_notif')
        .upsert({ task_id: taskId, read_by_unit_head: false, read_by_assignee: false, read_by_director: false },
          { onConflict: 'task_id' })
    }

    await fetchTasks()
  }

  // ── APPROVE ─────────────────────────────────────────────
  // role: 'unit_head' | 'director'
  const approveTask = async (taskId, role) => {
    const auth = useAuthStore()
    const col  = role === 'director' ? 'director' : 'unit_head'
    await supabase.from('task_approval')
      .update({ [col]: true, revision_comment: null, revised_at: null })
      .eq('id', taskId)

    // Notify assignee of approval
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      await supabase.from('task_revision').insert({
        task_id:   taskId,
        from_user: auth.user.id,
        to_user:   task.assignee,
        role,
        comment:   role === 'director' ? '✓ Task approved by Director.' : '✓ Task approved by Unit Head — forwarded to Director.',
        is_read:   false,
      })
    }
    await fetchTasks()
  }

  // ── REQUEST REVISION ────────────────────────────────────
  const requestRevision = async (taskId, comment, role) => {
    const auth = useAuthStore()
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    // Reset approval flag(s)
    const resetCols = role === 'director'
      ? { unit_head: false, director: false, revision_comment: comment, revised_at: new Date().toISOString() }
      : { unit_head: false, revision_comment: comment, revised_at: new Date().toISOString() }

    await supabase.from('task_approval').update(resetCols).eq('id', taskId)
    await supabase.from('task_profile').update({ revision: true }).eq('id', taskId)

    // Insert revision thread message to assignee
    await supabase.from('task_revision').insert({
      task_id:   taskId,
      from_user: auth.user.id,
      to_user:   task.assignee,
      role,
      comment,
      is_read:   false,
    })

    await fetchTasks()
  }

  // ── RESUBMIT after revision ─────────────────────────────
  const resubmitTask = async (taskId, newOutputLink) => {
    if (newOutputLink) {
      const { data: updated, error: updErr } = await supabase
        .from('task_output')
        .update({ link: newOutputLink })
        .eq('id', taskId)
        .select('id')
      if (updErr) throw new Error(updErr.message)
      if (!updated || updated.length === 0) {
        const { error: insErr } = await supabase
          .from('task_output')
          .insert({ id: taskId, link: newOutputLink })
        if (insErr) throw new Error(insErr.message)
      }
    }
    // Clear revision flag, reset to pending unit head
    await supabase.from('task_profile').update({ revision: false }).eq('id', taskId)
    await supabase.from('task_approval')
      .update({ unit_head: false, director: false, revision_comment: null, revised_at: null })
      .eq('id', taskId)
    await fetchTasks()
  }

  // ── FETCH REVISIONS for a task ──────────────────────────
  const fetchRevisions = async (taskId) => {
    const auth = useAuthStore()
    const { data } = await supabase
      .from('task_revision')
      .select('id, from_user, to_user, role, comment, is_read, created_at')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    // mark unread messages as read
    const unread = (data||[]).filter(r => r.to_user === auth.user?.id && !r.is_read).map(r => r.id)
    if (unread.length) {
      await supabase.from('task_revision').update({ is_read: true }).in('id', unread)
    }

    return (data || []).map(r => ({
      ...r,
      fromName: nameMap.value[r.from_user] || r.from_user,
    }))
  }

  return {
    tasks, loading, nameMap, unitMembers,
    fetchTasks, addTasks, submitOutput,
    approveTask, requestRevision, resubmitTask, fetchRevisions,
  }
})