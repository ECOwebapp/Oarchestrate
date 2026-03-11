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
        // ── Director: fetch ALL root tasks from every user ──
        // Single broad query, JS-side filtering avoids Supabase joined-column filter bugs
        const { data: allRows, error } = await supabase
          .from('task')
          .select(TASK_SELECT)
          .is('parent_id', null)
          .order('id', { ascending: false })

        if (error) throw error

        // Resolve all names in one call
        await resolveNames([
          ...new Set((allRows || []).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))
        ])

        // Attach assignee role so dashboard/detail can identify who's who
        const assigneeIds = [...new Set((allRows || []).map(t => t.assignee).filter(Boolean))]
        let roleMap = {}
        if (assigneeIds.length) {
          const { data: roles } = await supabase
            .from('member_type').select('user_id, role_id').in('user_id', assigneeIds)
          ;(roles || []).forEach(r => { roleMap[r.user_id] = r.role_id })
        }

        tasks.value = (allRows || []).map(t => ({
          ...mapRow(t),
          assigneeRole: roleMap[t.assignee] || null,
        }))

      } else if (auth.isUnitHead) {
        // ── Unit Head: fetch all tasks assigned to anyone in the same unit ──
        // Includes the unit head themselves + all their unit members
        if (!auth.unitId) { tasks.value = []; return }

        const { data: unitUsers } = await supabase
          .from('unit')
          .select('user_id')
          .eq('unit_id', auth.unitId)

        const unitUserIds = (unitUsers || []).map(m => m.user_id)
        // Always include current user even if not in unit table
        const allIds = [...new Set([uid, ...unitUserIds])]

        const assigneeFilter = allIds.map(id => `assignee.eq.${id}`).join(',')
        const { data: rows, error } = await supabase
          .from('task')
          .select(TASK_SELECT)
          .is('parent_id', null)
          .or(assigneeFilter)
          .order('id', { ascending: false })

        if (error) throw error

        await resolveNames([
          ...new Set((rows || []).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))
        ])

        // Attach assignee role for dashboard filtering
        const assigneeIds2 = [...new Set((rows || []).map(t => t.assignee).filter(Boolean))]
        let roleMap2 = {}
        if (assigneeIds2.length) {
          const { data: roles } = await supabase
            .from('member_type').select('user_id, role_id').in('user_id', assigneeIds2)
          ;(roles || []).forEach(r => { roleMap2[r.user_id] = r.role_id })
        }

        tasks.value = (rows || []).map(t => ({
          ...mapRow(t),
          assigneeRole: roleMap2[t.assignee] || null,
          isOwnTask: t.assignee === uid,
        }))

        // Also update unitMembers list for AddTask dropdown etc.
        await fetchUnitMembers()

      } else {
        // ── Member: fetch only their own tasks ──
        const { data: rows, error } = await supabase
          .from('task')
          .select(TASK_SELECT)
          .is('parent_id', null)
          .eq('assignee', uid)
          .order('id', { ascending: false })

        if (error) throw error

        await resolveNames([
          ...new Set((rows || []).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))
        ])
        tasks.value = (rows || []).map(mapRow)
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
    const auth = useAuthStore()
    const task = tasks.value.find(t => t.id === taskId)

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

    // Find who last requested the revision so we can re-route correctly
    const { data: lastRevision } = await supabase
      .from('task_revision')
      .select('role, from_user')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const revisorRole = lastRevision?.role || 'unit_head'

    if (revisorRole === 'director') {
      // Director requested revision → skip unit head, go straight back to director
      // unit_head=true so directorPending filter (outputLink && !director) picks it up
      await supabase.from('task_profile')
        .update({ revision: false }).eq('id', taskId)
      await supabase.from('task_approval')
        .update({ unit_head: true, director: false, revision_comment: null, revised_at: null })
        .eq('id', taskId)

      // Notify the director who requested the revision
      if (lastRevision?.from_user) {
        await supabase.from('task_revision').insert({
          task_id:   taskId,
          from_user: auth.user.id,
          to_user:   lastRevision.from_user,
          role:      'director',
          comment:   'Revised output resubmitted — awaiting your final approval.',
          is_read:   false,
        })
      }

      await supabase.from('task_notif')
        .upsert(
          { task_id: taskId, read_by_director: false, read_by_assignee: true, read_by_unit_head: true },
          { onConflict: 'task_id' }
        )

    } else {
      // Unit head requested revision → reset and re-notify unit head
      await supabase.from('task_profile')
        .update({ revision: false }).eq('id', taskId)
      await supabase.from('task_approval')
        .update({ unit_head: false, director: false, revision_comment: null, revised_at: null })
        .eq('id', taskId)

      // Find and notify the unit head of the assignee's unit
      if (task?.assignee) {
        const { data: assigneeUnit } = await supabase
          .from('unit').select('unit_id').eq('user_id', task.assignee).maybeSingle()
        if (assigneeUnit?.unit_id) {
          const { data: unitUsers } = await supabase
            .from('unit').select('user_id').eq('unit_id', assigneeUnit.unit_id)
          if (unitUsers?.length) {
            const unitUserIds = unitUsers.map(u => u.user_id)
            const { data: uhMembers } = await supabase
              .from('member_type').select('user_id')
              .eq('role_id', 2).in('user_id', unitUserIds)
            for (const uh of (uhMembers || [])) {
              await supabase.from('task_revision').insert({
                task_id:   taskId,
                from_user: auth.user.id,
                to_user:   uh.user_id,
                role:      'unit_head',
                comment:   ' Revised output resubmitted — awaiting your review.',
                is_read:   false,
              })
            }
          }
        }
      }

      await supabase.from('task_notif')
        .upsert(
          { task_id: taskId, read_by_unit_head: false, read_by_assignee: true, read_by_director: false },
          { onConflict: 'task_id' }
        )
    }

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