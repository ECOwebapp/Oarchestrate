import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ── Org constants ─────────────────────────────────────────────────────────────
// unit_name:  1 = Planning and Design Unit
//             2 = Project Implementation Unit
//             3 = Office
// role_type:  1 = Director  |  2 = Unit Head  |  3 = Unit Member  |  4 = Admin
//
// Approval flow:
//   Office (unit_id=3)           → output goes DIRECTLY to Director  (no Unit Head step)
//   Self-assigned tasks          → output goes DIRECTLY to Director  (no Unit Head step)
//   Planning / Implementation    → output goes to Unit Head → then Director
// ─────────────────────────────────────────────────────────────────────────────
const OFFICE_UNIT_ID = 3

export const taskStore = defineStore('tasks', () => {
  const tasks       = ref([])
  const loading     = ref(false)
  const nameMap     = ref({})   // userId → full name  (cached)
  const unitIdMap   = ref({})   // userId → unit_id    (cached)
  const unitMembers = ref([])

  // ── Name resolver (batch, cached) ──────────────────────────────────────────
  const resolveNames = async (uids) => {
    const missing = uids.filter(id => id && !nameMap.value[id])
    if (!missing.length) return
    const { data } = await supabase
      .from('members')
      .select('user_id, fname, lname')
      .in('user_id', missing)
    ;(data || []).forEach(p => {
      nameMap.value[p.user_id] = `${p.fname || ''} ${p.lname || ''}`.trim()
    })
  }

  // ── Unit-ID resolver (batch, cached) ───────────────────────────────────────
  const resolveUnitIds = async (uids) => {
    const missing = uids.filter(id => id && !(id in unitIdMap.value))
    if (!missing.length) return
    const { data } = await supabase
      .from('position_of_members')
      .select('user_id, unit_id')
      .in('user_id', missing)
    ;(data || []).forEach(u => { unitIdMap.value[u.user_id] = u.unit_id })
    // Users with no unit row are stored as null so we don't re-query them
    missing.forEach(id => { if (!(id in unitIdMap.value)) unitIdMap.value[id] = null })
  }

  // ── Small helpers ───────────────────────────────────────────────────────────
  const getAssigneeUnitId = (userId) => unitIdMap.value[userId] ?? null
  const isOfficeUser      = (userId) => getAssigneeUnitId(userId) === OFFICE_UNIT_ID

  const getDirectorId = async () => {
    const { data } = await supabase
      .from('position_of_members').select('user_id').eq('pos_id', 1).maybeSingle()
    return data?.user_id || null
  }

  // ── Supabase select fragment ────────────────────────────────────────────────
  const TASK_SELECT = `
    id, parent_id, assigner, assignee, design,
    task_profile ( title, description, urgent, revision, task_type,
      task_type_ref:task_type(task_type) ),
    task_approval ( unit_head, director, revision_comment, revised_at ),
    task_duration ( created, deadline ),
    task_output   ( link ),
    subtasks:task!parent_id (
      id, assignee, assigner,
      task_profile ( title, description, urgent ),
      task_approval ( unit_head, director ),
      task_duration ( deadline ),
      task_output   ( link )
    )
  `

  const mapRow = (t) => ({
    id:              t.id,
    parentId:        t.parent_id,
    assigner:        t.assigner,
    assignee:        t.assignee,
    assignerName:    nameMap.value[t.assigner] || '—',
    assigneeName:    nameMap.value[t.assignee] || '—',
    name:            t.task_profile?.title        || '',
    description:     t.task_profile?.description  || '',
    urgent:          !!t.task_profile?.urgent,
    revision:        !!t.task_profile?.revision,
    type:            t.task_profile?.task_type_ref?.task_type || '',
    typeId:          t.task_profile?.task_type    || null,
    from:            t.task_duration?.created     || null,
    to:              t.task_duration?.deadline    || null,
    startDate:       t.task_duration?.created     || null,
    endDate:         t.task_duration?.deadline    || null,
    outputLink:      t.task_output?.link ?? '',
    unitHead:        !!t.task_approval?.unit_head,
    director:        !!t.task_approval?.director,
    revisionComment: t.task_approval?.revision_comment || '',
    revisedAt:       t.task_approval?.revised_at  || null,
    design:          !!t.design,
    isSelfAssigned:  t.assigner === t.assignee,
    subtasks: (t.subtasks || []).map(s => ({
      id:           s.id,
      name:         s.task_profile?.title       || '',
      description:  s.task_profile?.description || '',
      urgent:       !!s.task_profile?.urgent,
      unitHead:     !!s.task_approval?.unit_head,
      director:     !!s.task_approval?.director,
      outputLink:   s.task_output?.link ?? '',
      assignee:     s.assignee,
      assigner:     s.assigner,
      assigneeName: nameMap.value[s.assignee] || '',
      assignerName: nameMap.value[s.assigner] || '',
      endDate:      t.task_duration?.deadline  || null,
    })),
  })

  // ── FETCH UNIT MEMBERS (AddTask dropdown) ──────────────────────────────────
  const fetchUnitMembers = async () => {
    const auth = useAuthStore()
    const activeUnitId = computed(() => {
      const headRole = auth.positions?.find(p => p.pos_id === 4)
      return headRole?.unit_id ?? null
    })

    if (!auth.isUnitHead || !activeUnitId.value) return
    try {
      const { data: unitUsers, error } = await supabase
        .from('position_of_members').select('user_id').eq('unit_id', activeUnitId.value)

      if (error) { console.error('[taskStore] fetchUnitMembers:', error); return }

      const userIds = (unitUsers || []).map(u => u.user_id)
      const [, roleRes] = await Promise.all([
        resolveNames(userIds),
        supabase.from('position_of_members').select('user_id, pos_id').in('user_id', userIds),
      ])
      const roleMap = Object.fromEntries((roleRes.data || []).map(r => [r.user_id, r.pos_id]))

      unitMembers.value = userIds.map(userId => ({
        id:            userId,
        name:          nameMap.value[userId] || 'Unknown',
        posId:         roleMap[userId] || null,
        posType:       roleMap[userId] === 1 ? 'Director'
                      : roleMap[userId] === 4 ? 'Unit Head'
                      : ![1, 4, 11].includes(roleMap[userId]) ? 'Exempted' : 'Unknown',
        isCurrentUser: userId === auth.userID,
      }))
    } catch (e) {
      console.error('[taskStore] fetchUnitMembers:', e)
    }
  }

  // ── FETCH TASKS ─────────────────────────────────────────────────────────────
  const fetchTasks = async () => {
    const auth = useAuthStore()
    const uid  = auth.user?.id
    if (!uid) return
    loading.value = true

    try {
      if (auth.isDirector) {
        // ── Director: ALL root tasks from every user ──────────────────────────
        const { data: rows, error } = await supabase
          .from('task')
          .select(TASK_SELECT)
          .is('parent_id', null)
          .order('id', { ascending: false })
        if (error) throw error

        const allUserIds  = [...new Set((rows || []).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))]
        const assigneeIds = [...new Set((rows || []).map(t => t.assignee).filter(Boolean))]

        const [, , roleRes] = await Promise.all([
          resolveNames(allUserIds),
          resolveUnitIds(assigneeIds),
          supabase.from('position_of_members').select('user_id, pos_id').in('user_id', assigneeIds),
        ])
        const roleMap = Object.fromEntries((roleRes.data || []).map(r => [r.user_id, r.pos_id]))

        tasks.value = (rows || []).map(t => ({
          ...mapRow(t),
          assigneeRole:     roleMap[t.assignee]          || null,
          assigneeUnitId:   getAssigneeUnitId(t.assignee),
          assigneeIsOffice: isOfficeUser(t.assignee),
        }))

      } else if (auth.isUnitHead) {
        // ── Unit Head: all tasks in their own unit (unit_id 1 or 2 only) ─────
        const activeUnitId = computed(() => {
          const headRole = auth.positions?.find(p => p.pos_id === 4)
          return headRole?.unit_id ?? null
        })

        if (!activeUnitId.value) { tasks.value = []; return }

        const { data: unitUsers } = await supabase
          .from('position_of_members').select('user_id').eq('unit_id', activeUnitId.value)
        const unitUserIds = (unitUsers || []).map(m => m.user_id)
        const allIds      = [...new Set([uid, ...unitUserIds])]

        const { data: rows, error } = await supabase
          .from('task')
          .select(TASK_SELECT)
          .is('parent_id', null)
          .or(allIds.map(id => `assignee.eq.${id}`).join(','))
          .order('id', { ascending: false })
        if (error) throw error

        const allUserIds  = [...new Set((rows || []).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))]
        const assigneeIds = [...new Set((rows || []).map(t => t.assignee).filter(Boolean))]

        const [, , roleRes] = await Promise.all([
          resolveNames(allUserIds),
          resolveUnitIds(assigneeIds),
          supabase.from('position_of_members').select('user_id, pos_id').in('user_id', assigneeIds),
        ])
        const roleMap = Object.fromEntries((roleRes.data || []).map(r => [r.user_id, r.pos_id]))

        tasks.value = (rows || []).map(t => ({
          ...mapRow(t),
          assigneeRole:     roleMap[t.assignee]          || null,
          assigneeUnitId:   getAssigneeUnitId(t.assignee),
          assigneeIsOffice: isOfficeUser(t.assignee),
          isOwnTask:        t.assignee === uid,
        }))

        await fetchUnitMembers()

      } else {
        // ── Unit Member: only their own tasks ────────────────────────────────
        const { data: rows, error } = await supabase
          .from('task')
          .select(TASK_SELECT)
          .is('parent_id', null)
          .eq('assignee', uid)
          .order('id', { ascending: false })
        if (error) throw error

        const allUserIds = [...new Set((rows || []).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))]
        await Promise.all([resolveNames(allUserIds), resolveUnitIds([uid])])

        tasks.value = (rows || []).map(t => ({
          ...mapRow(t),
          assigneeUnitId:   getAssigneeUnitId(uid),
          assigneeIsOffice: isOfficeUser(uid),
        }))
      }

    } catch (e) {
      console.error('[taskStore] fetchTasks:', e)
    } finally {
      loading.value = false
    }
  }

  // ── NOTIFICATION HELPER ─────────────────────────────────────────────────────
  const _notifySubmission = async (taskId, assigneeId, fromUserId, message = null, isSelfAssigned = false) => {
    await resolveUnitIds([assigneeId])
    const assigneeIsOffice = isOfficeUser(assigneeId)
    const assigneeUnitId   = getAssigneeUnitId(assigneeId)

    if (assigneeIsOffice || isSelfAssigned) {
      const directorId = await getDirectorId()
      if (directorId) {
        await supabase.from('task_revision').insert({
          task_id:   taskId,
          from_user: fromUserId,
          to_user:   directorId,
          role:      'director',
          comment:   message || '📎 Output submitted — awaiting your approval.',
          is_read:   false,
        })
      }
      await supabase.from('task_notif').upsert(
        { task_id: taskId, read_by_director: false, read_by_assignee: true, read_by_unit_head: true },
        { onConflict: 'task_id' }
      )
    } else {
      const { data: unitUsers } = await supabase
        .from('position').select('user_id').eq('unit_id', assigneeUnitId)
      if (unitUsers?.length) {
        const unitUserIds = unitUsers.map(u => u.user_id)
        const { data: uhMembers } = await supabase
          .from('position').select('user_id')
          .eq('pos_id', 4).in('user_id', unitUserIds)
        for (const uh of (uhMembers || [])) {
          await supabase.from('task_revision').insert({
            task_id:   taskId,
            from_user: fromUserId,
            to_user:   uh.user_id,
            role:      'unit_head',
            comment:   message || '📎 Output submitted — awaiting your review.',
            is_read:   false,
          })
        }
      }
      await supabase.from('task_notif').upsert(
        { task_id: taskId, read_by_unit_head: false, read_by_assignee: true, read_by_director: false },
        { onConflict: 'task_id' }
      )
    }
  }

  // ── ADD TASK ────────────────────────────────────────────────────────────────
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

    const outputLink = mainTask.outputLink || ''
    const hasOutput  = !!outputLink

    await resolveUnitIds([assigneeId])
    const assigneeIsOffice     = isOfficeUser(assigneeId)
    const isDirectorSelfAssign = auth.isDirector && assigneeId === uid

    let initialUnitHead = false
    let initialDirector = false
    const isSelfAssigned = assigneeId === uid
    if (isDirectorSelfAssign) {
      initialUnitHead = true
      initialDirector = true
    } else if (isSelfAssigned || (hasOutput && assigneeIsOffice)) {
      initialUnitHead = true
    }

    await Promise.all([
      supabase.from('task_profile').insert({
        id: taskId, title: mainTask.name, description: mainTask.description,
        task_type: mainTask.type, urgent: !!mainTask.urgent, revision: false,
      }),
      supabase.from('task_approval').insert({
        id: taskId, unit_head: initialUnitHead, director: initialDirector,
      }),
      supabase.from('task_duration').insert({
        id: taskId, created: new Date().toISOString().split('T')[0], deadline: mainTask.endDate,
      }),
      supabase.from('task_output').insert({ id: taskId, link: outputLink }),
    ])

    if (hasOutput && !isDirectorSelfAssign) {
      await _notifySubmission(taskId, assigneeId, uid, null, isSelfAssigned)
    }

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

  // ── SUBMIT OUTPUT ───────────────────────────────────────────────────────────
  const submitOutput = async (taskId, link) => {
    const auth = useAuthStore()

    const { data: updated, error: updErr } = await supabase
      .from('task_output').update({ link }).eq('id', taskId).select('id')
    if (updErr) throw new Error(updErr.message)
    if (!updated || updated.length === 0) {
      const { error: insErr } = await supabase.from('task_output').insert({ id: taskId, link })
      if (insErr) throw new Error(insErr.message)
    }

    const { data: taskRow } = await supabase
      .from('task').select('assignee, assigner').eq('id', taskId).maybeSingle()
    const assigneeId = taskRow?.assignee || auth.user.id
    const assignerId = taskRow?.assigner || auth.user.id
    const isSelfAssigned = assigneeId === assignerId

    await resolveUnitIds([assigneeId])

    if (isSelfAssigned || isOfficeUser(assigneeId)) {
      await supabase.from('task_approval').update({ unit_head: true }).eq('id', taskId)
    }

    await _notifySubmission(taskId, assigneeId, auth.user.id, null, isSelfAssigned)
    await fetchTasks()
  }

  // ── APPROVE ─────────────────────────────────────────────────────────────────
  const approveTask = async (taskId, role) => {
    const auth = useAuthStore()
    const col  = role === 'director' ? 'director' : 'unit_head'
    await supabase.from('task_approval')
      .update({ [col]: true, revision_comment: null, revised_at: null })
      .eq('id', taskId)

    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      await supabase.from('task_revision').insert({
        task_id:   taskId,
        from_user: auth.user.id,
        to_user:   task.assignee,
        role,
        comment:   role === 'director'
          ? '✅ Task fully approved by Director.'
          : '✅ Task approved by Unit Head — forwarded to Director.',
        is_read: false,
      })
    }
    await fetchTasks()
  }

  // ── REQUEST REVISION ────────────────────────────────────────────────────────
  const requestRevision = async (taskId, comment, role) => {
    const auth = useAuthStore()
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    const resetCols = role === 'director'
      ? { unit_head: false, director: false, revision_comment: comment, revised_at: new Date().toISOString() }
      : { unit_head: false, revision_comment: comment, revised_at: new Date().toISOString() }

    await supabase.from('task_approval').update(resetCols).eq('id', taskId)
    await supabase.from('task_profile').update({ revision: true }).eq('id', taskId)
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

  // ── RESUBMIT after revision ─────────────────────────────────────────────────
  const resubmitTask = async (taskId, newOutputLink) => {
    const auth = useAuthStore()
    const task = tasks.value.find(t => t.id === taskId)

    if (newOutputLink) {
      const { data: updated, error: updErr } = await supabase
        .from('task_output').update({ link: newOutputLink }).eq('id', taskId).select('id')
      if (updErr) throw new Error(updErr.message)
      if (!updated || updated.length === 0) {
        const { error: insErr } = await supabase
          .from('task_output').insert({ id: taskId, link: newOutputLink })
        if (insErr) throw new Error(insErr.message)
      }
    }

    const { data: lastRevision } = await supabase
      .from('task_revision')
      .select('role, from_user')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const revisorRole = lastRevision?.role || 'unit_head'
    const assigneeId  = task?.assignee || auth.user.id

    await supabase.from('task_profile').update({ revision: false }).eq('id', taskId)

    if (revisorRole === 'director') {
      await supabase.from('task_approval')
        .update({ unit_head: true, director: false, revision_comment: null, revised_at: null })
        .eq('id', taskId)

      if (lastRevision?.from_user) {
        await supabase.from('task_revision').insert({
          task_id:   taskId,
          from_user: auth.user.id,
          to_user:   lastRevision.from_user,
          role:      'director',
          comment:   '📎 Revised output resubmitted — awaiting your final approval.',
          is_read:   false,
        })
      }
      await supabase.from('task_notif').upsert(
        { task_id: taskId, read_by_director: false, read_by_assignee: true, read_by_unit_head: true },
        { onConflict: 'task_id' }
      )

    } else {
      await resolveUnitIds([assigneeId])
      const assigneeIsOffice = isOfficeUser(assigneeId)
      const assignerData = await supabase.from('task').select('assigner').eq('id', taskId).maybeSingle()
      const isSelfAssigned = assignerData?.data?.assigner === assigneeId

      if (assigneeIsOffice || isSelfAssigned) {
        await supabase.from('task_approval')
          .update({ unit_head: true, director: false, revision_comment: null, revised_at: null })
          .eq('id', taskId)
      } else {
        await supabase.from('task_approval')
          .update({ unit_head: false, director: false, revision_comment: null, revised_at: null })
          .eq('id', taskId)
      }

      await _notifySubmission(
        taskId, assigneeId, auth.user.id,
        '📎 Revised output resubmitted — awaiting your review.',
        isSelfAssigned
      )
    }

    await fetchTasks()
  }

  // ── FETCH REVISIONS for a task ──────────────────────────────────────────────
  const fetchRevisions = async (taskId) => {
    const auth = useAuthStore()
    const { data } = await supabase
      .from('task_revision')
      .select('id, from_user, to_user, role, comment, is_read, created_at')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })

    const unread = (data || []).filter(r => r.to_user === auth.user?.id && !r.is_read).map(r => r.id)
    if (unread.length) {
      await supabase.from('task_revision').update({ is_read: true }).in('id', unread)
    }

    return (data || []).map(r => ({
      ...r,
      fromName: nameMap.value[r.from_user] || r.from_user,
    }))
  }

  // ── DELETE TASKS ────────────────────────────────────────────────────────────
  // Permission rules:
  //   Director  → can delete any task
  //   Unit Head → can only delete tasks they created (assigner === their uid)
  //
  // DELETE TASKS
  // Permission rules:
  //   Director  - can delete any task
  //   Unit Head - can only delete tasks they created (assigner === their uid)
  //
  // Each child table is deleted sequentially (not in parallel) so FK errors
  // surface immediately with a clear message instead of being swallowed.
  const deleteTasks = async (taskIds) => {
    const auth = useAuthStore()
    const uid  = auth.user?.id

    if (!auth.isDirector && !auth.isUnitHead) {
      throw new Error('You do not have permission to delete tasks.')
    }

    // Authorization filter
    // Unit Heads may only delete tasks where they are the assigner
    let allowedIds = [...taskIds]
    if (auth.isUnitHead && !auth.isDirector) {
      allowedIds = tasks.value
        .filter(t => taskIds.includes(t.id) && t.assigner === uid)
        .map(t => t.id)
      if (!allowedIds.length) {
        throw new Error('You can only delete tasks that you assigned.')
      }
    }

    // Collect subtask IDs so they are cleaned up too
    const { data: subtaskRows, error: subFetchErr } = await supabase
      .from('task')
      .select('id')
      .in('parent_id', allowedIds)
    if (subFetchErr) throw new Error('Failed to fetch subtasks: ' + subFetchErr.message)

    const subtaskIds = (subtaskRows || []).map(r => r.id)
    const allIds     = [...allowedIds, ...subtaskIds]

    console.log('[deleteTasks] allIds:', allIds)

    // Helper: delete rows and log result without throwing on empty-result
    const del = async (table, column, ids) => {
      if (!ids.length) return
      const { error } = await supabase.from(table).delete().in(column, ids)
      if (error) {
        console.warn('[deleteTasks] ' + table + '.' + column + ':', error.message)
        // Do not throw here - missing rows are fine, we just log and continue
      } else {
        console.log('[deleteTasks] deleted from ' + table)
      }
    }

    // Delete in strict dependency order to avoid FK violations

    // Step 1: tables referencing task via task_id column
    await del('task_revision',   'task_id', allIds)
    await del('task_poke',       'task_id', allIds)
    await del('comment_section', 'task_id', allIds)
    await del('task_notif',      'task_id', allIds)

    // Step 2: tables referencing task via id column
    await del('design_approval', 'id', allIds)
    await del('task_output',     'id', allIds)
    await del('task_approval',   'id', allIds)
    await del('task_duration',   'id', allIds)
    await del('task_profile',    'id', allIds)

    // Step 3: delete subtasks before parents (FK: task.parent_id -> task.id)
    if (subtaskIds.length) {
      const { error } = await supabase.from('task').delete().in('id', subtaskIds)
      if (error) throw new Error('Failed to delete subtasks: ' + error.message)
      console.log('[deleteTasks] deleted subtasks')
    }

    // Step 4: delete parent tasks
    const { error: delErr } = await supabase.from('task').delete().in('id', allowedIds)
    if (delErr) throw new Error('Failed to delete tasks: ' + delErr.message)
    console.log('[deleteTasks] deleted parent tasks')

    // Step 5: remove from local store so UI updates immediately
    tasks.value = tasks.value.filter(t => !allIds.includes(t.id))

    return allowedIds.length
  }

  // -- ASSIGN SUBTASK ----------------------------------------------------------
  // Unit Head assigns an existing unassigned subtask to a unit member.
  // Creates a brand-new child task row linked to the parent, pre-filled with
  // the subtask's title/description, then optionally marks the old placeholder
  // subtask row as taken (or we simply re-assign the existing row).
  //
  // Strategy: update the existing subtask row's assignee + re-insert related
  // rows so the member sees it as their own task.
  const assignSubtask = async ({ subtaskId, assigneeId, parentTask }) => {
    const auth = useAuthStore()
    const uid  = auth.user?.id

    // Re-assign the subtask to the chosen member
    const { error: taskErr } = await supabase
      .from('task')
      .update({ assignee: assigneeId, assigner: uid })
      .eq('id', subtaskId)
    if (taskErr) throw new Error('Failed to assign subtask: ' + taskErr.message)

    // Ensure task_approval row exists and is reset to pending
    await supabase.from('task_approval')
      .upsert({ id: subtaskId, unit_head: false, director: false, revision_comment: null, revised_at: null },
               { onConflict: 'id' })

    // Ensure task_output row exists
    await supabase.from('task_output')
      .upsert({ id: subtaskId, link: '' }, { onConflict: 'id' })

    // Notify the assigned member via task_notif
    await supabase.from('task_notif')
      .upsert({ task_id: subtaskId, read_by_assignee: false, read_by_unit_head: true, read_by_director: false },
               { onConflict: 'task_id' })

    await fetchTasks()
  }


  return {
    tasks, loading, nameMap, unitMembers,
    fetchTasks, addTasks, submitOutput,
    approveTask, requestRevision, resubmitTask, fetchRevisions,
    fetchUnitMembers, deleteTasks, assignSubtask,
  }
})