import { deleteOutputFile } from '@/lib/uploadOutput'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { usePosStore } from './positions'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

const OFFICE_UNIT_ID = 3

export const useSubtaskStore = defineStore('subtasks', () => {
  const subtasks = ref([])
  const loading = ref(false)
  const nameMap = ref({})
  const unitIdMap = ref({})
  const unitMembers = ref([])
  const positions = usePosStore()
  const { memberPos } = storeToRefs(positions)

  // ── Name resolver ───────────────────────────────────────────────────────────
  const resolveNames = async (uids) => {
    const missing = uids.filter(id => id && !nameMap.value[id])
    if (!missing.length) return
    const { data } = await supabase
      .from('members')
      .select('user_id, fname, lname')
      .in('user_id', missing)
      ; (data || []).forEach(p => {
        nameMap.value[p.user_id] = `${p.fname || ''} ${p.lname || ''}`.trim()
      })
  }

  // ── Unit-ID resolver ────────────────────────────────────────────────────────
  const resolveUnitIds = async (uids) => {
    const missing = uids.filter(id => id && !(id in unitIdMap.value))
    if (!missing.length) return
    const auth = useAuthStore()
    const activeUnitHeadId = (auth.positions || []).find(p => Number(p.pos_id) === 4)?.unit_id ?? null
    const { data } = await supabase
      .from('position_of_members')
      .select('user_id, unit_id')
      .in('user_id', missing)
      .order('unit_id', { ascending: true })

    const memberships = {}
      ; (data || []).forEach(u => {
        if (!u?.user_id || u.unit_id == null) return
        if (!memberships[u.user_id]) memberships[u.user_id] = []
        memberships[u.user_id].push(u.unit_id)
      })

    Object.entries(memberships).forEach(([userId, units]) => {
      const preferred = activeUnitHeadId != null && units.includes(activeUnitHeadId)
        ? activeUnitHeadId
        : units[0]
      unitIdMap.value[userId] = preferred ?? null
    })

    missing.forEach(id => { if (!(id in unitIdMap.value)) unitIdMap.value[id] = null })
  }

  const getAssigneeUnitId = (userId) => unitIdMap.value[userId] ?? null
  const isOfficeUser = (userId) => getAssigneeUnitId(userId) === OFFICE_UNIT_ID

  const getDirectorId = async () => {
    const { data } = await supabase
      .from('position_of_members').select('user_id').eq('pos_id', 1).maybeSingle()
    return data?.user_id || null
  }

  // ── Supabase select fragment ────────────────────────────────────────────────

  const SUBTASK_SELECT = `
  id, parent_task_id, parent_subtask_id, assigner, assignee, design,
  task_profile!subtask_id ( title, description, urgent, revision, task_type,
    task_type_ref:task_type(task_type) ),
  task_approval!subtask_id ( unit_head, director, revision_comment, revised_at ),
  task_duration!subtask_id ( created, deadline ),
  task_output!subtask_id ( link ),
  children:subtask!parent_subtask_id(id, parent_subtask_id)
`

  const SPAWNED_SELECT = `
    id, parent_subtask_id, assigner, assignee, design,
    task_profile ( title, description, urgent, revision, task_type,
      task_type_ref:task_type(task_type) ),
    task_approval ( unit_head, director, revision_comment, revised_at ),
    task_duration ( created, deadline ),
    task_output   ( link )
  `

  const subtaskRow = (st, spawnedMap = {}) => ({
    id: st.id,
    parentTaskId: st.parent_task_id,
    parentSubsubTaskId: st.parent_subtask_id,
    assigner: st.assigner,
    assignee: st.assignee,
    assignerName: nameMap.value[st.assigner] || '—',
    assigneeName: nameMap.value[st.assignee] || '—',
    name: st.task_profile?.title || '',
    description: st.task_profile?.description || '',
    urgent: !!st.task_profile?.urgent,
    revision: !!st.task_profile?.revision,
    type: st.task_profile?.task_type_ref?.task_type || '',
    typeId: st.task_profile?.task_type || null,
    from: st.task_duration?.created || null,
    to: st.task_duration?.deadline || null,
    startDate: st.task_duration?.created || null,
    endDate: st.task_duration?.deadline || null,
    outputLink: st.task_output?.link ?? '',
    unitHead: !!st.task_approval?.unit_head,
    director: !!st.task_approval?.director,
    revisionComment: st.task_approval?.revision_comment || '',
    revisedAt: st.task_approval?.revised_at || null,
    overdue: (() => {
      const dl = st.task_duration?.deadline ? new Date(st.task_duration.deadline) : null
      if (!dl || st.task_approval?.director) return false
      dl.setHours(23, 59, 59, 999)
      return dl < new Date()
    })(),
    overdueDays: (() => {
      const dl = st.task_duration?.deadline ? new Date(st.task_duration.deadline) : null
      if (!dl || st.task_approval?.director) return 0
      dl.setHours(23, 59, 59, 999)
      const diff = new Date() - dl
      return diff > 0 ? Math.ceil(diff / 86400000) : 0
    })(),
    design: !!st.design,
    isSelfAssigned: st.assigner === st.assignee,
    assigned_subtasks: (st.children || []).map(s => {
      const spawned = spawnedMap[s.id] || null
      return {
        id: s.id,
        name: s.task_profile?.title || '',
        description: s.task_profile?.description || '',
        urgent: !!s.task_profile?.urgent,
        unitHead: spawned ? !!spawned.task_approval?.unit_head : !!s.task_approval?.unit_head,
        director: spawned ? !!spawned.task_approval?.director : !!s.task_approval?.director,
        outputLink: spawned ? (spawned.task_output?.link ?? '') : (s.task_output?.link ?? ''),
        assignee: s.assignee,
        assigner: s.assigner,
        assigneeName: nameMap.value[s.assignee] || '',
        assignerName: nameMap.value[s.assigner] || '',
        endDate: s.task_duration?.deadline || null,
        spawnedTaskId: spawned?.id || null,
        spawnedAssignee: spawned?.assignee || null,
        spawnedAssigneeName: spawned ? (nameMap.value[spawned.assignee] || '') : '',
        isAssigned: !!spawned,
      }
    }),

  })

  // ── buildSpawnedMap ─────────────────────────────────────────────────────────
  const buildSpawnedMap = (allRows) => {
    const map = {}
    for (const row of (allRows || [])) {
      if (!row.parent_task_id && row.parent_subtask_id) {
        map[row.parent_subtask_id] = row
      }
    }
    return map
  }

  // ── fetchSpawnedForSubtasks ─────────────────────────────────────────────────
  const fetchSpawnedForSubtasks = async (spawnedTaskIds) => {
    if (!spawnedTaskIds.length) return []
    const { data, error } = await supabase
      .from('subtask')
      .select(SPAWNED_SELECT)
      .in('parent_subtask_id', spawnedTaskIds)
      .is('parent_task_id', null)
    if (error) {
      console.error('[fetchSpawnedForSubtasks]', error.message)
      return []
    }
    return data || []
  }

  // ── FETCH UNIT MEMBERS ──────────────────────────────────────────────────────
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
        id: userId,
        name: nameMap.value[userId] || 'Unknown',
        posId: roleMap[userId] || null,
        posType: roleMap[userId] === 1 ? 'Director'
          : roleMap[userId] === 4 ? 'Unit Head'
            : ![1, 4, 11].includes(roleMap[userId]) ? 'Exempted' : 'Unknown',
        isCurrentUser: userId === auth.userID,
      }))
    } catch (e) {
      console.error('[taskStore] fetchUnitMembers:', e)
    }
  }

  // ── FETCH SUBTASKS ─────────────────────────────────────────────────────────────
  const fetchSubTasks = async (parentTaskId = null) => {
    const auth = useAuthStore()
    const uid = auth.user?.id
    if (!uid) return
    loading.value = true

    try {
      if (auth.isDirector) {
        let query = supabase.from('subtask').select(SUBTASK_SELECT)
        if (parentTaskId) query = query.eq('parent_task_id', parentTaskId)

        const { data: subtaskRows, error: subtaskErr } = await query
          .order('id', { ascending: false })

        if (subtaskErr) throw subtaskErr

        const allSubsubTaskIds = (subtaskRows || []).flatMap(t => (t.children || []).map(s => s.id))
        const extraSpawnedRows = await fetchSpawnedForSubtasks(allSubsubTaskIds)

        const allUserIds = [...new Set([
          // Users assigned to the Subtasks themselves
          ...(subtaskRows || []).flatMap(s => [s.assigner, s.assignee]),

          // Users assigned to the Spawned Tasks (the grandchild layer)
          ...(extraSpawnedRows || []).flatMap(ex => [ex.assigner, ex.assignee])
        ].filter(Boolean))]
        const assigneeIds = [...new Set((subtaskRows || []).map(t => t.assignee).filter(Boolean))]

        const extraAssigneeIds = extraSpawnedRows.map(r => r.assignee).filter(Boolean)
        const allIdsToResolve = [...new Set([...allUserIds, ...extraAssigneeIds])]

        await Promise.all([
          resolveNames(allIdsToResolve),
          resolveUnitIds(assigneeIds),
        ])

        const posRes = memberPos.value.filter(mp => mp.user_id === assigneeIds)
        const roleMap = Object.fromEntries((posRes || []).map(r => [r.user_id, r.pos_id]))

        const spawnedMap = buildSpawnedMap([...(subtaskRows || []), ...extraSpawnedRows])
        const parentRows = (subtaskRows || []).filter(r => !r.parent_subtask_id)

        subtasks.value = parentRows.map(t => ({
          ...subtaskRow(t, spawnedMap),
          assigneeRole: roleMap[t.assignee] || null,
          assigneeUnitId: getAssigneeUnitId(t.assignee),
          assigneeIsOffice: isOfficeUser(t.assignee),
        }))

        console.log(subtaskRows)

      } else if (auth.isUnitHead) {
        const activeUnitId = computed(() => {
          const headRole = auth.positions?.find(p => p.pos_id === 4)
          return headRole?.unit_id ?? null
        })
        if (!activeUnitId.value) { subtasks.value = []; return }

        const unitUsers = memberPos.value.filter(mp => mp.unit_id === activeUnitId.value)
        const unitUserIds = (unitUsers || []).map(m => m.user_id)
        const allIds = [...new Set([uid, ...unitUserIds])]

        let query = supabase.from('subtask').select(SUBTASK_SELECT)
        if (parentTaskId) query = query.eq('parent_task_id', parentTaskId)

        const { data: subtaskRows, error } = await query
          .order('id', { ascending: false })
          .or(allIds.map(id => `assignee.eq.${id}`).join(','))
          .order('id', { ascending: false })
        if (error) throw error

        // console.log(rows)

        const allSubsubTaskIds = (subtaskRows || []).flatMap(t => (t.children || []).map(s => s.id))
        const extraSpawnedRows = await fetchSpawnedForSubtasks(allSubsubTaskIds)

        const allUserIds = [...new Set([
          // Users assigned to the Subtasks themselves
          ...(subtaskRows || []).flatMap(s => [s.assigner, s.assignee]),

          // Users assigned to the Spawned Tasks (the grandchild layer)
          ...(extraSpawnedRows || []).flatMap(ex => [ex.assigner, ex.assignee])
        ].filter(Boolean))]
        const assigneeIds = [...new Set((subtaskRows || []).map(t => t.assignee).filter(Boolean))]

        const extraAssigneeIds = extraSpawnedRows.map(r => r.assignee).filter(Boolean)
        const allIdsToResolve = [...new Set([...allUserIds, ...extraAssigneeIds])]

        await Promise.all([
          resolveNames(allIdsToResolve),
          resolveUnitIds(assigneeIds),
        ])

        const posRes = memberPos.value.filter(mp => mp.user_id === assigneeIds)
        const roleMap = Object.fromEntries((posRes || []).map(r => [r.user_id, r.pos_id]))

        const spawnedMap = buildSpawnedMap([...(subtaskRows || []), ...extraSpawnedRows])

        subtasks.value = rows.map(t => ({
          ...subtaskRow(t, spawnedMap),
          assigneeRole: roleMap[t.assignee] || null,
          assigneeUnitId: getAssigneeUnitId(t.assignee),
          assigneeIsOffice: isOfficeUser(t.assignee),
          isOwnTask: t.assignee === uid,
        }))

        await fetchUnitMembers()

      } else {


        let query = supabase.from('subtask').select(SUBTASK_SELECT)
        if (parentTaskId) query = query.eq('parent_task_id', parentTaskId)

        const { data: subtaskRows, error } = await query
          .order('id', { ascending: false })
          .eq('assignee', uid)
          .order('id', { ascending: false })
        if (error) throw error

        const allUserIds = [...new Set((subtaskRows || []).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))]
        await Promise.all([resolveNames(allUserIds), resolveUnitIds([uid])])

        subtasks.value = (subtaskRows || []).map(t => ({
          ...subtaskRows(t, {}),
          assigneeUnitId: getAssigneeUnitId(uid),
          assigneeIsOffice: isOfficeUser(uid),
        }))
      }

    } catch (e) {
      console.error('[taskStore] fetchSubTasks:', e)
    } finally {
      loading.value = false
    }
  }

  const fetchTaskById = async (subtaskId) => {
    const { data, error } = await supabase
      .from('task')
      .select(SUBTASK_SELECT)
      .eq('id', subtaskId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) throw new Error('TSubtask not found.')

    const allUserIds = [
      data.assigner, data.assignee
    ].filter(Boolean)

    await resolveNames([...new Set([...allUserIds])])

    const spawnedMap = buildSpawnedMap([data])
    return subtaskRow(data, spawnedMap)
  }

  // ── NOTIFICATION HELPER ─────────────────────────────────────────────────────
  const _notifySubmission = async (subTaskId, assigneeId, fromUserId, message = null, isSelfAssigned = false) => {
    await resolveUnitIds([assigneeId])
    const assigneeIsOffice = isOfficeUser(assigneeId)
    const assigneeUnitId = getAssigneeUnitId(assigneeId)
    const directorId = await getDirectorId()

    if (assigneeIsOffice || isSelfAssigned) {
      if (directorId) {
        const { data: existing } = await supabase
          .from('task_revision')
          .select('id')
          .eq('subtask_id', subTaskId)
          .eq('to_user', directorId)
          .eq('is_read', false)
          .maybeSingle()

        if (!existing) {
          await supabase.from('task_revision').insert({
            subtask_id: subTaskId,
            from_user: fromUserId,
            to_user: directorId,
            role: 1,
            comment: message || 'To Director: Output submitted — awaiting your approval.',
          })
        }
      }
      await supabase.from('task_notif').upsert(
        { subtask_id: subTaskId, read_by_assignee: true, read_by_unit_head: true },
        { onConflict: 'task_id' }
      )
    } else {
      const { data: uhRows } = await supabase
        .from('position_of_members')
        .select('user_id')
        .eq('unit_id', assigneeUnitId)
        .eq('pos_id', 4)

      const uhIds = [...new Set((uhRows || []).map(r => r.user_id))]

      const allUnitHeads = positions.memberPos
        .filter(link => link.pos_id === 4)
        .map(link => link.user_id)

      // 2. Check if the current sender is in that list
      const isSenderAUnitHead = allUnitHeads.includes(fromUserId)

      for (const uhId of uhIds) {
        const { data: existing } = await supabase
          .from('task_revision')
          .select('id')
          .eq('subtask_id', subTaskId)
          .eq('to_user', uhId)
          .eq('is_read', false)
          .maybeSingle()

        console.log('I should\'ve been called once: ', uhId)

        if (!existing) {
          await supabase.from('task_revision').insert({
            subtask_id: subTaskId,
            from_user: fromUserId,
            to_user: uhId,
            role: 4,
            comment: message || 'From Unit Head: Output submitted — awaiting your review.',
          })
        } else if (!existing && isSenderAUnitHead) {
          await supabase.from('task_revision').insert({
            subtask_id: subTaskId,
            from_user: fromUserId,
            to_user: directorId,
            role: 4,
            comment: message || 'From Unit Head: Output submitted — awaiting your review.',
          })
        }
      }

      await supabase.from('task_notif').upsert(
        { subtask_id: subTaskId, read_by_assignee: true },
        { onConflict: 'subtask_id' }
      )
    }
  }

  // ── ADD TASK ────────────────────────────────────────────────────────────────
  const addSubTasks = async ({ subTask }) => {
    const auth = useAuthStore()
    const uid = auth.user?.id
    const assigneeId = auth.isMember ? uid : subTask.assignee

    const { data: subtaskRow, error: taskErr } = await supabase
      .from('subtask')
      .insert({
        parent_task_id: subTask.parentId,
        assigner: subTask?.assignee ? uid : null,
        assignee: subTask?.assignee ? assigneeId : null,
        design: subTask?.design
      })
      .select('id').single()
    if (taskErr) throw taskErr
    const subTaskId = subtaskRow.id

    const outputLink = subTask.outputLink || ''
    const hasOutput = !!outputLink

    await resolveUnitIds([assigneeId])
    const assigneeIsOffice = isOfficeUser(assigneeId)
    const isDirectorSelfAssign = auth.isDirector && assigneeId === uid

    let initialUnitHead = false
    let initialDirector = false
    const isSelfAssigned = assigneeId === uid
    if (isDirectorSelfAssign) {
      initialUnitHead = true
      initialDirector = true
    } else if ((isSelfAssigned && subTask.type === 2) || (hasOutput && assigneeIsOffice)) {
      initialUnitHead = true
    }

    await Promise.all([
      supabase.from('task_profile').insert({
        subtask_id: subTaskId, title: subTask.name, description: subTask.description,
        task_type: subTask.type, urgent: !!subTask.urgent,
      }),
      supabase.from('task_approval').insert({
        subtask_id: subTaskId, unit_head: initialUnitHead, director: initialDirector,
      }),
      supabase.from('task_duration').insert({
        subtask_id: subTaskId, deadline: subTask.endDate,
      }),
    ])

    if (subTask.outputLink) supabase.from('task_output').insert({ subtask_id: subTaskId, link: outputLink })

    if (hasOutput && !isDirectorSelfAssign || subTask?.assignee) {
      await _notifySubmission(subTaskId, assigneeId, uid, null, isSelfAssigned)
    }

    // for (const sub of (spawnedTasks || []).filter(s => s.description?.trim())) {
    //   const { data: subRow } = await supabase
    //     .from('subtask').insert({ assigner: uid, assignee: assigneeId, parent_subtask_id: subTaskId })
    //     .select('id').single()
    //   if (!subRow) continue
    //   await Promise.all([
    //     supabase.from('task_profile').insert({
    //       id: subRow.id, title: sub.description, description: sub.description,
    //       task_type: subTask.type, urgent: false,
    //     }),
    //     supabase.from('task_approval').insert({ id: subRow.id, unit_head: false, director: false }),
    //     supabase.from('task_duration').insert({
    //       id: subRow.id, created: new Date().toISOString().split('T')[0], deadline: subTask.endDate,
    //     }),
    //     supabase.from('task_output').insert({ id: subRow.id, link: '' }),
    //   ])
    // }

    // await fetchTasks()
  }

  // ── SUBMIT OUTPUT ───────────────────────────────────────────────────────────
  const submitOutput = async (subTaskId, link) => {
    const auth = useAuthStore()

    const { data: updated, error: updErr } = await supabase
      .from('task_output').upsert({ link }).eq('subtask_id', subTaskId).select('id')
    if (updErr) throw new Error(updErr.message)
    // if (!updated || updated.length === 0) {
    //   const { error: insErr } = await supabase.from('task_output').insert({ id: subTaskId, link })
    //   if (insErr) throw new Error(insErr.message)
    // }

    const { data: taskRow } = await supabase
      .from('subtask').select('assignee, assigner').eq('id', subTaskId).maybeSingle()
    const assigneeId = taskRow?.assignee || auth.user.id
    const assignerId = taskRow?.assigner || auth.user.id
    const isSelfAssigned = assigneeId === assignerId

    await resolveUnitIds([assigneeId])
    if (isSelfAssigned || isOfficeUser(assigneeId)) {
      await supabase.from('task_approval').update({ unit_head: true }).eq('subtask_id', subTaskId)
    }

    await _notifySubmission(subTaskId, assigneeId, auth.user.id, null, isSelfAssigned)
    await fetchSubTasks()
  }

  // ── EDIT OUTPUT ───────────────────────────────────────────────────────────────────────
  const editOutput = async (subTaskId, newLink) => {
    const auth = useAuthStore()

    // 1. Grab the old link before overwriting so we can delete it from Drive
    const { data: oldOutput } = await supabase
      .from('task_output')
      .select('link')
      .eq('subtask_id', subTaskId)
      .maybeSingle()
    const oldLink = oldOutput?.link || null

    // 2. Swap the output link in Supabase
    const { error: updErr } = await supabase
      .from('task_output')
      .upsert({ link: newLink })
      .eq('subtask_id', subTaskId)
    if (updErr) throw new Error(updErr.message)

    // 3. Delete the old Drive file (fire-and-forget)
    if (oldLink && oldLink !== newLink) {
      deleteOutputFile(oldLink).catch((e) =>
        console.warn('[editOutput] Could not delete old Drive file:', e.message)
      )
    }

    // 4. Mark old pending notifications as read so a fresh one can go through
    await supabase
      .from('task_revision')
      .update({ is_read: true })
      .eq('subtask_id', subTaskId)
      .eq('is_read', false)

    // 5. Re-notify the reviewer with the updated file
    const { data: taskRow } = await supabase
      .from('subtask').select('assignee, assigner').eq('id', subTaskId).maybeSingle()
    const assigneeId = taskRow?.assignee || auth.user.id
    const assignerId = taskRow?.assigner || auth.user.id
    const isSelfAssigned = assigneeId === assignerId

    await _notifySubmission(
      subTaskId,
      assigneeId,
      auth.user.id,
      '📝 Submission updated — please review the new file.',
      isSelfAssigned
    )

    await fetchSubTasks()
  }

  // ── DELETE OUTPUT ───────────────────────────────────────────────────────────────────────
  const deleteOutput = async (subTaskId) => {
    // 1. Grab the current link so we can delete it from Drive
    const { data: currentOutput } = await supabase
      .from('task_output')
      .select('link')
      .eq('subtask_id', subTaskId)
      .maybeSingle()
    const currentLink = currentOutput?.link || null

    if (currentLink) {
      // 2. Clear the link in Supabase
      const { error: clearErr } = await supabase
        .from('task_output')
        .update({ link: '' })
        .eq('subtask_id', subTaskId)
      if (clearErr) throw new Error(clearErr.message)

      // 3. Delete the Drive file (fire-and-forget)
      deleteOutputFile(currentLink).catch((e) =>
        console.warn('[deleteOutput] Could not delete Drive file:', e.message)
      )
    }

    await Promise.all([
      // 4. Reset approval flags back to pre-submission state
      supabase
        .from('task_approval')
        .update({ unit_head: false, revision_comment: null, revised_at: null })
        .eq('subtask_id', subTaskId),

      // 5. Dismiss pending reviewer notifications
      supabase
        .from('task_revision')
        .update({ is_read: true })
        .eq('subtask_id', subTaskId)
        .eq('is_read', false),

      // 6. Defensive: clear revision flag
      supabase
        .from('task_profile')
        .update({ revision: false })
        .eq('subtask_id', subTaskId)
    ])

    await fetchSubTasks()
  }

  // ── APPROVE ─────────────────────────────────────────────────────────────────
  const approveSubTask = async (subTaskId, role) => {
    const auth = useAuthStore()
    const col = role === 'director' ? 'director' : 'unit_head'
    await supabase.from('task_approval')
      .update({ [col]: true, revision_comment: null, revised_at: null })
      .eq('id', subTaskId)

    const task = subtasks.value.find(t => t.id === subTaskId)
    if (task) {
      await supabase.from('task_revision').insert({
        subtask_id: subTaskId,
        from_user: auth.user.id,
        to_user: task.assignee,
        role: 1,
        comment: role === 'director'
          ? '✅ Task fully approved by Director.'
          : '✅ Task approved by Unit Head — forwarded to Director.',
        is_read: false,
      })
    }
    await fetchSubTasks()
  }

  // ── REQUEST REVISION ────────────────────────────────────────────────────────
  const requestRevision = async (subTaskId, comment, role) => {
    const auth = useAuthStore()
    const task = subtasks.value.find(t => t.id === subTaskId)
    if (!task) return

    const resetCols = role === 'director'
      ? { unit_head: false, director: false, revision_comment: comment, revised_at: new Date().toISOString() }
      : { unit_head: false, revision_comment: comment, revised_at: new Date().toISOString() }

    await Promise.all([
      supabase.from('task_approval').update(resetCols).eq('subtask_id', subTaskId),
      supabase.from('task_profile').update({ revision: true }).eq('subtask_id', subTaskId),
      supabase.from('task_revision').insert({
        subtask_id: subTaskId,
        from_user: auth.user.id,
        to_user: task.assignee,
        role: role === 'director' ? 1 : 4,
        comment,
      })
    ])
    await fetchSubTasks()
  }

  // ── RESUBMIT ────────────────────────────────────────────────────────────────
  const resubmitTask = async (subTaskId, newOutputLink) => {
    const auth = useAuthStore()
    const task = subtasks.value.find(t => t.id === subTaskId)

    if (newOutputLink) {
      const { data: updated, error: updErr } = await supabase
        .from('task_output')
        .upsert({ link: newOutputLink })
        .eq('subtask_id', subTaskId).select('id')
      if (updErr) throw new Error(updErr.message)

      // if (!updated || updated.length === 0) {
      //   const { error: insErr } = await supabase
      //     .from('task_output')
      //     .insert({ subtask_id: subTaskId, link: newOutputLink })

      //   if (insErr) throw new Error(insErr.message)
      // }
    }

    const { data: lastRevision } = await supabase
      .from('task_revision')
      .select('role, from_user')
      .eq('subtask_id', subTaskId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const revisorRole = lastRevision?.role || 'unit_head'
    const assigneeId = task?.assignee || auth.user.id

    await supabase.from('task_profile').update({ revision: false }).eq('id', subTaskId)

    if (revisorRole === 'director') {
      await supabase.from('task_approval')
        .update({ unit_head: true, director: false, revision_comment: null, revised_at: null })
        .eq('id', subTaskId)

      if (lastRevision?.from_user) {
        await supabase.from('task_revision').insert({
          subtask_id: subTaskId,
          from_user: auth.user.id,
          to_user: lastRevision.from_user,
          role: 1,
          comment: '📎 Revised output resubmitted — awaiting your final approval.',
        })
      }
      await supabase.from('task_notif').upsert(
        { subtask_id: subTaskId, read_by_director: false, read_by_assignee: true, read_by_unit_head: true },
        { onConflict: 'task_id' }
      )
    } else {
      await resolveUnitIds([assigneeId])
      const assigneeIsOffice = isOfficeUser(assigneeId)
      const assignerData = await supabase
        .from('subtask')
        .select('assigner')
        .eq('subtask_id', subTaskId)
        .maybeSingle()
      const isSelfAssigned = assignerData?.data?.assigner === assigneeId

      if (assigneeIsOffice || isSelfAssigned) {
        await supabase
          .from('task_approval')
          .update({ unit_head: true, director: false, revision_comment: null, revised_at: null })
          .eq('subtask_id', subTaskId)
      } else {
        await supabase
          .from('task_approval')
          .update({ unit_head: false, director: false, revision_comment: null, revised_at: null })
          .eq('subtask_id', subTaskId)
      }

      await _notifySubmission(
        subTaskId, assigneeId, auth.user.id,
        '📎 Revised output resubmitted — awaiting your review.',
        isSelfAssigned
      )
    }
    await fetchSubTasks()
  }

  // ── FETCH REVISIONS ─────────────────────────────────────────────────────────
  const fetchRevisions = async (subTaskId) => {
    const auth = useAuthStore()
    const { data } = await supabase
      .from('task_revision')
      .select('id, subtask_id, from_user, to_user, role, comment, is_read, created_at')
      .eq('subtask_id', subTaskId)
      .order('created_at', { ascending: true })

    const unread = (data || []).filter(r => r.to_user === auth.user?.id && !r.is_read).map(r => r.id)
    if (unread.length) {
      await supabase.from('task_revision').update({ is_read: true }).in('subtask_id', unread)
    }

    return (data || []).map(r => ({
      ...r,
      fromName: nameMap.value[r.from_user] || r.from_user,
    }))
  }

  // ── DELETE TASKS ────────────────────────────────────────────────────────────
  const deleteSubTasks = async (subTaskIds) => {
    const auth = useAuthStore()
    const uid = auth.user?.id

    if (!auth.isDirector && !auth.isUnitHead) {
      throw new Error('You do not have permission to delete subtasks.')
    }

    let allowedIds = [...subTaskIds]
    if (auth.isUnitHead && !auth.isDirector) {
      allowedIds = subtasks.value
        .filter(t => subTaskIds.includes(t.id) && t.assigner === uid)
        .map(t => t.id)
      if (!allowedIds.length) throw new Error('You can only delete subtasks that you assigned.')
    }

    const { data: subtaskRows } = await supabase
      .from('subtask')
      .select('id')
      .in('subtask_id', allowedIds)
    const spawnedTaskIds = (subtaskRows || []).map(r => r.id)

    const { data: spawnedRows } = spawnedTaskIds.length
      ? await supabase
        .from('subtask')
        .select('id')
        .in('parent_subtask_id', spawnedTaskIds)
      : { data: [] }
    const spawnedIds = (spawnedRows || []).map(r => r.id)

    const allIds = [...allowedIds, ...spawnedTaskIds, ...spawnedIds]

    const del = async (table, column, ids) => {
      if (!ids.length) return
      const { error } = await supabase.from(table).delete().in(column, ids)
      if (error) console.warn('[deleteTasks]', table, error.message)
    }

    await Promise.all([
      del('task_revision', 'subtask_id', allIds),
      del('task_poke', 'subtask_id', allIds),
      del('comment_section', 'subtask_id', allIds),
      del('task_notif', 'subtask_id', allIds),
      del('design_approval', 'subtask_id', allIds),
      del('task_output', 'subtask_id', allIds),
      del('task_approval', 'subtask_id', allIds),
      del('task_duration', 'subtask_id', allIds),
      del('task_profile', 'subtask_id', allIds)
    ])

    if (spawnedIds.length) {
      await supabase.from('subtask').delete().in('id', spawnedIds)
    }
    if (spawnedTaskIds.length) {
      await supabase.from('subtask').delete().in('id', spawnedTaskIds)
    }
    await supabase.from('subtask').delete().in('id', allowedIds)

    subtasks.value = subtasks.value.filter(t => !allIds.includes(t.id))
    return allowedIds.length
  }

  // ── ASSIGN SUBTASK ──────────────────────────────────────────────────────────
  const assignSubtask = async ({ subTaskId = null, spawnedTaskId = null, assigneeId, parentTask = null, design, urgent }) => {
    const auth = useAuthStore()
    const uid = auth.user?.id

    const isSelfAssign = String(assigneeId) === String(uid)

    if (spawnedTaskId) {
      try {
        const { data, error } = await supabase
          .from('subtask')
          .update({ assignee: assigneeId, design: design || false })
          .eq('parent_subtask_id', Number(spawnedTaskId))
          .select('id')
          .maybeSingle()

        console.log(data.id)

        if (error) throw new Error('Failed to reassign: ' + error.message)

        if (urgent) {
          const { error: profileError } = await supabase
            .from('task_profile')
            .update({ urgent: urgent || false })
            .eq('id', data.id)

          if (profileError) throw profileError
        }

        await supabase.from('subtask_assignment_log').insert({
          subtask_id: spawnedTaskId,
          assigned_by: uid,
          assigned_to: assigneeId,
        })
      } catch (e) {
        console.log('Error re-assigning: ', e)
      } finally {
        await Promise.all([resolveNames([assigneeId])])
      }

    } else {
      try {
        const { data: subtaskRow } = await supabase
          .from('subtask')
          .select(`
          id,
          task_profile ( title, description, task_type ),
          task_duration ( deadline )
        `)
          .eq('id', subTaskId)
          .maybeSingle()
        console.log(subTaskId)

        const { data: newTask, error: newTaskErr } = await supabase
          .from('subtask')
          .insert({
            assigner: uid,
            assignee: assigneeId,
            parent_task_id: null,
            parent_subtask_id: subTaskId,
            design: design || false,
          })
          .select('id')
          .single()
        if (newTaskErr) throw new Error('Failed to create task: ' + newTaskErr.message)

        const id = newTask.id
        const deadline = subtaskRow?.task_duration?.deadline || parentTask?.endDate || null
        const type = subtaskRow?.task_profile?.task_type || parentTask?.typeId || null

        await Promise.all([
          supabase.from('task_profile').insert({
            id: id,
            title: subtaskRow?.task_profile?.title || '',
            description: subtaskRow?.task_profile?.description || '',
            task_type: type,
            urgent: urgent || false,
            revision: false,
          }),
          supabase.from('task_approval').insert({
            id,
            unit_head: false,
            director: false,
          }),
          supabase.from('task_duration').insert({
            id,
            created: new Date().toISOString().split('T')[0],
            deadline,
          }),
          supabase.from('task_output').insert({ id, link: '' }),
        ])

        if (!isSelfAssign) {
          await supabase.from('task_notif').upsert(
            { task_id: id, read_by_assignee: false, read_by_unit_head: true, read_by_director: false },
            { onConflict: 'task_id' }
          )
        }

        await supabase.from('subtask_assignment_log').insert({
          subtask_id: subTaskId,
          assigned_by: uid,
          assigned_to: assigneeId,
        })
      } catch (e) {
        console.log('Error assigning: ', e)
      } finally {
        await Promise.all([resolveNames([assigneeId])])
      }
    }
  }

  return {
    subtasks, loading, nameMap, unitMembers,
    fetchSubTasks, addSubTasks, submitOutput,
    approveSubTask, requestRevision, resubmitTask, fetchRevisions,
    fetchUnitMembers, deleteSubTasks, assignSubtask,
    fetchTaskById,
    // new
    editOutput, deleteOutput,
  }
})