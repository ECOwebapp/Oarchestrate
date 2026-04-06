import { deleteOutputFile } from '@/lib/uploadOutput'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { usePosStore } from './positions'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'

const OFFICE_UNIT_ID = 3

export const taskStore = defineStore('tasks', () => {
  const tasks = ref([])
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
  const TASK_SELECT = `
    id, parent_ppa_id, assigner, assignee, design,
    task_profile(title, description, urgent, revision, task_type,
      task_type_ref:task_type(task_type) ),
    task_approval( unit_head, director, revision_comment, revised_at ),
    task_duration( created, deadline ),
    task_output( link )
  `

  // ── mapRow ──────────────────────────────────────────────────────────────────
  const mapRow = (t) => ({
    id: t.id,
    parentId: t.parent_ppa_id,
    assigner: t.assigner,
    assignee: t.assignee,
    assignerName: nameMap.value[t.assigner] || '—',
    assigneeName: nameMap.value[t.assignee] || '—',
    name: t.task_profile?.title || '',
    description: t.task_profile?.description || '',
    urgent: !!t.task_profile?.urgent,
    revision: !!t.task_profile?.revision,
    type: t.task_profile?.task_type_ref?.task_type || '',
    typeId: t.task_profile?.task_type || null,
    from: t.task_duration?.created || null,
    to: t.task_duration?.deadline || null,
    startDate: t.task_duration?.created || null,
    endDate: t.task_duration?.deadline || null,
    outputLink: t.task_output?.link ?? '',
    unitHead: !!t.task_approval?.unit_head,
    director: !!t.task_approval?.director,
    revisionComment: t.task_approval?.revision_comment || '',
    revisedAt: t.task_approval?.revised_at || null,
    overdue: (() => {
      const dl = t.task_duration?.deadline ? new Date(t.task_duration.deadline) : null
      if (!dl || t.task_approval?.director) return false
      dl.setHours(23, 59, 59, 999)
      return dl < new Date()
    })(),
    overdueDays: (() => {
      const dl = t.task_duration?.deadline ? new Date(t.task_duration.deadline) : null
      if (!dl || t.task_approval?.director) return 0
      dl.setHours(23, 59, 59, 999)
      const diff = new Date() - dl
      return diff > 0 ? Math.ceil(diff / 86400000) : 0
    })(),
    design: !!t.design,
    isSelfAssigned: t.assigner === t.assignee,
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

  // ── FETCH TASKS ─────────────────────────────────────────────────────────────
  const fetchTasks = async (parentId = null) => {
    const auth = useAuthStore()
    const uid = auth.user?.id
    if (!uid) return
    loading.value = true

    try {
      if (auth.isDirector) {
        let query = supabase
          .from('task')
          .select(TASK_SELECT);

        if (parentId) {
          // If design is true, we filter by the parent_ppa_id
          query = query.eq('parent_ppa_id', Number(parentId));
        }

        const { data: taskRows, error: taskError } = await query
          .order('id', { ascending: false });

        if (taskError) throw taskError

        const allUserIds = [...new Set((taskRows || []).flatMap(t => [
          t.assigner, t.assignee
        ]).filter(Boolean))]
        const assigneeIds = [...new Set((taskRows || []).map(t => t.assignee).filter(Boolean))]
        const allIdsToResolve = [...new Set([...allUserIds])]

        await Promise.all([
          resolveNames(allIdsToResolve),
          resolveUnitIds(assigneeIds),
        ])
        const posRes = memberPos.value.filter(mp => mp.user_id === assigneeIds)
        const roleMap = Object.fromEntries((posRes || []).map(r => [r.user_id, r.pos_id]))

        tasks.value = taskRows.map(t => ({
          ...mapRow(t),
          assigneeRole: roleMap[t.assignee] || null,
          assigneeUnitId: getAssigneeUnitId(t.assignee),
          assigneeIsOffice: isOfficeUser(t.assignee),
        }))

      } else if (auth.isUnitHead) {
        const activeUnitId = computed(() => {
          const headRole = auth.positions?.find(p => p.pos_id === 4)
          return headRole?.unit_id ?? null
        })
        if (!activeUnitId.value) { tasks.value = []; return }

        // const { data: unitUsers } = await supabase
        //   .from('position_of_members').select('user_id').eq('unit_id', activeUnitId.value)

        const unitUsers = memberPos.value.filter(mp => mp.unit_id === activeUnitId.value)

        const unitUserIds = (unitUsers || []).map(m => m.user_id)
        const allIds = [...new Set([uid, ...unitUserIds])]

        let query = supabase
          .from('task')
          .select(TASK_SELECT);

        if (parentId) {
          // If design is true, we filter by the parent_ppa_id
          query = query.eq('parent_ppa_id', Number(parentId));
        }

        const { data: taskRows, error } = await query
          .or(allIds.map(id => `assignee.eq.${id}`).join(','))
          .order('id', { ascending: false })
        if (error) throw error

        // console.log(rows)

        const allUserIds = [...new Set((taskRows || [])
          .flatMap(t => [t.assigner, t.assignee])
          .filter(Boolean))]
        const assigneeIds = [...new Set((taskRows || []).map(t => t.assignee).filter(Boolean))]
        const allIdsToResolve = [...new Set([...allUserIds])]

        await Promise.all([
          resolveNames(allIdsToResolve),
          resolveUnitIds(assigneeIds),
        ])

        const posRes = memberPos.value.filter(mp => mp.user_id === assigneeIds)
        const roleMap = Object.fromEntries((posRes || []).map(r => [r.user_id, r.pos_id]))

        tasks.value = taskRows.map(t => ({
          ...mapRow(t),
          assigneeRole: roleMap[t.assignee] || null,
          assigneeUnitId: getAssigneeUnitId(t.assignee),
          assigneeIsOffice: isOfficeUser(t.assignee),
          isOwnTask: t.assignee === uid,
        }))

        await fetchUnitMembers()

      } else {
        let query = supabase
          .from('task')
          .select(TASK_SELECT);

        if (parentId) {
          // If design is true, we filter by the parent_ppa_id
          query = query.eq('parent_ppa_id', Number(parentId));
        }

        const { data: taskRows, error } = await query
          .eq('assignee', uid)
          .order('id', { ascending: false })
        if (error) throw error

        const allUserIds = [...new Set((taskRows || []).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))]
        await Promise.all([resolveNames(allUserIds), resolveUnitIds([uid])])

        tasks.value = (taskRows || []).map(t => ({
          ...mapRow(t),
          assigneeUnitId: getAssigneeUnitId(uid),
          assigneeIsOffice: isOfficeUser(uid),
        }))
      }

    } catch (e) {
      console.error('[taskStore] fetchTasks:', e)
    } finally {
      loading.value = false
    }
  }

  // ── FETCH SINGLE TASK BY ID ─────────────────────────────────────────────────
  const fetchTaskById = async (taskId) => {
    const { data, error } = await supabase
      .from('task')
      .select(TASK_SELECT)
      .eq('id', taskId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) throw new Error('Task not found.')

    const allUserIds = [
      data.assigner, data.assignee
    ].filter(Boolean)

    await resolveNames([...new Set([...allUserIds])])

    const spawnedMap = buildSpawnedMap([data])
    console.log(mapRow(data))
    return mapRow(data)
  }

  // ── NOTIFICATION HELPER ─────────────────────────────────────────────────────
  const _notifySubmission = async (taskId, assigneeId, fromUserId, message = null, isSelfAssigned = false) => {
    await resolveUnitIds([assigneeId])
    const assigneeIsOffice = isOfficeUser(assigneeId)
    const assigneeUnitId = getAssigneeUnitId(assigneeId)
    const directorId = await getDirectorId()

    if (assigneeIsOffice || isSelfAssigned) {
      if (directorId) {
        const { data: existing } = await supabase
          .from('task_revision')
          .select('id')
          .eq('task_id', taskId)
          .eq('to_user', directorId)
          .eq('is_read', false)
          .maybeSingle()

        if (!existing) {
          await supabase.from('task_revision').insert({
            task_id: taskId,
            from_user: fromUserId,
            to_user: directorId,
            role: 1, // Director
            comment: message || 'To Director: Output submitted — awaiting your approval.',
            is_read: false,
          })
        }
      }
      await supabase.from('task_notif').upsert(
        { task_id: taskId, read_by_assignee: true, read_by_unit_head: true },
        { onConflict: 'task_id' }
      )
    } else {
      const { data: uhRows } = await supabase
        .from('position')
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
          .eq('task_id', taskId)
          .eq('to_user', uhId)
          .eq('is_read', false)
          .maybeSingle()

        console.log('I should\'ve been called once: ', uhId)

        if (!existing) {
          await supabase.from('task_revision').insert({
            task_id: taskId,
            from_user: fromUserId,
            to_user: uhId,
            role: 4, // Unit Head
            comment: message || 'From Unit Head: Output submitted — awaiting your review.',
          })
        } else if (!existing && isSenderAUnitHead) {
          await supabase.from('task_revision').insert({
            task_id: taskId,
            from_user: fromUserId,
            to_user: directorId,
            role: 4,
            comment: message || 'From Unit Head: Output submitted — awaiting your review.',
          })
        }
      }

      await supabase.from('task_notif').upsert(
        { task_id: taskId, read_by_assignee: true },
        { onConflict: 'task_id' }
      )
    }
  }

  // ── ADD TASK ────────────────────────────────────────────────────────────────
  const addTasks = async ({ mainTask }) => {
    const auth = useAuthStore()
    const uid = auth.user?.id
    const assigneeId = auth.isMember ? uid : mainTask.assignee

    const taskData = {
      parent_ppa_id: mainTask.parentId,
      assigner: mainTask.assignee ? uid : null,
      assignee: mainTask.assignee ? assigneeId : null,
      design: !!mainTask.design
    };
    
    // Only add the ID if it's truthy (exists in DB)
    if (mainTask.id) {
      taskData.id = mainTask.id;
    }
    
    const { data: taskRow, error: taskErr } = await supabase
      .from('task')
      .upsert(taskData, { onConflict: 'id' })
      .select('id').single()
    if (taskErr) throw taskErr
    const taskId = taskRow.id

    const outputLink = mainTask.outputLink || ''
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
    } else if ((isSelfAssigned && mainTask.type === 2) || (hasOutput && assigneeIsOffice)) {
      initialUnitHead = true
    }

    await Promise.all([
      supabase.from('task_profile').upsert({
        task_id: taskId, title: mainTask.name, description: mainTask.description,
        task_type: mainTask.type, urgent: !!mainTask.urgent,
      }, { onConflict: 'task_id' }),
      supabase.from('task_approval').upsert({
        task_id: taskId, unit_head: initialUnitHead, director: initialDirector,
      }, { onConflict: 'task_id' }),
      supabase.from('task_duration').upsert({
        task_id: taskId, deadline: mainTask.endDate,
      }, { onConflict: 'task_id' }),
    ])

    if (mainTask.outputLink) await supabase.from('task_output').upsert({ task_id: taskId, link: outputLink }, { onConflict: 'task_id' })

    if (hasOutput && !isDirectorSelfAssign || mainTask.assignee) {
      await _notifySubmission(taskId, assigneeId, uid, null, isSelfAssigned)
    }

    // await fetchTasks()
  }

  // ── SUBMIT OUTPUT ───────────────────────────────────────────────────────────
  const submitOutput = async (taskId, link) => {
    const auth = useAuthStore()

    const { data: updated, error: updErr } = await supabase
      .from('task_output').upsert({ link }).eq('task_id', taskId).select('id')
    if (updErr) throw new Error(updErr.message)
    // if (!updated || updated.length === 0) {
    //   const { error: insErr } = await supabase.from('task_output').insert({ task_id: taskId, link })
    //   if (insErr) throw new Error(insErr.message)
    // }

    const { data: taskRow } = await supabase
      .from('task').select('assignee, assigner').eq('task_id', taskId).maybeSingle()
    const assigneeId = taskRow?.assignee || auth.user.id
    const assignerId = taskRow?.assigner || auth.user.id
    const isSelfAssigned = assigneeId === assignerId

    await resolveUnitIds([assigneeId])
    if (isSelfAssigned || isOfficeUser(assigneeId)) {
      await supabase.from('task_approval').update({ unit_head: true }).eq('task_id', taskId)
    }

    await _notifySubmission(taskId, assigneeId, auth.user.id, null, isSelfAssigned)
    await fetchTasks()
  }

  // ── EDIT OUTPUT ───────────────────────────────────────────────────────────────────────
  const editOutput = async (taskId, newLink) => {
    const auth = useAuthStore()

    // 1. Grab the old link before overwriting so we can delete it from Drive
    const { data: oldOutput } = await supabase
      .from('task_output')
      .select('link')
      .eq('task_id', taskId)
      .maybeSingle()
    const oldLink = oldOutput?.link || null

    // 3. Delete the old Drive file (fire-and-forget)
    if (oldLink && oldLink !== newLink) {
      // 2. Swap the output link in Supabase
      const { error: updErr } = await supabase
        .from('task_output')
        .update({ link: newLink })
        .eq('task_id', taskId)
      if (updErr) throw new Error(updErr.message)

      deleteOutputFile(oldLink).catch((e) =>
        console.warn('[editOutput] Could not delete old Drive file:', e.message)
      )
    }

    // 4. Mark old pending notifications as read so a fresh one can go through
    await supabase
      .from('task_revision')
      .update({ is_read: true })
      .eq('task_id', taskId)
      .eq('is_read', false)

    // 5. Re-notify the reviewer with the updated file
    const { data: taskRow } = await supabase
      .from('task').select('assignee, assigner').eq('task_id', taskId).maybeSingle()
    const assigneeId = taskRow?.assignee || auth.user.id
    const assignerId = taskRow?.assigner || auth.user.id
    const isSelfAssigned = assigneeId === assignerId

    await _notifySubmission(
      taskId,
      assigneeId,
      auth.user.id,
      '📝 Submission updated — please review the new file.',
      isSelfAssigned
    )

    await fetchTasks()
  }

  // ── DELETE OUTPUT ───────────────────────────────────────────────────────────────────────
  const deleteOutput = async (taskId) => {
    // 1. Grab the current link so we can delete it from Drive
    const { data: currentOutput } = await supabase
      .from('task_output')
      .select('link')
      .eq('task_id', taskId)
      .maybeSingle()
    const currentLink = currentOutput?.link || null

    // 3. Delete the Drive file (fire-and-forget)
    if (currentLink) {
      // 2. Clear the link in Supabase
      const { error: clearErr } = await supabase
        .from('task_output')
        .update({ link: '' })
        .eq('task_id', taskId)
      if (clearErr) throw new Error(clearErr.message)

      deleteOutputFile(currentLink).catch((e) =>
        console.warn('[deleteOutput] Could not delete Drive file:', e.message)
      )
    }

    await Promise.all([
      // 4. Reset approval flags back to pre-submission state
      supabase
        .from('task_approval')
        .update({ unit_head: false, revision_comment: null, revised_at: null })
        .eq('task_id', taskId),

      // 5. Dismiss pending reviewer notifications
      supabase
        .from('task_revision')
        .update({ is_read: true })
        .eq('task_id', taskId)
        .eq('is_read', false),

      // 6. Defensive: clear revision flag
      supabase
        .from('task_profile')
        .update({ revision: false })
        .eq('task_id', taskId)
    ])

    await fetchTasks()
  }

  // ── APPROVE ─────────────────────────────────────────────────────────────────
  const approveTask = async (taskId, role) => {
    const auth = useAuthStore()
    const col = role === 'director' ? 'director' : 'unit_head'
    await supabase.from('task_approval')
      .update({ [col]: true, revision_comment: null, revised_at: null })
      .eq('task_id', taskId)

    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      await supabase.from('task_revision').insert({
        task_id: taskId,
        from_user: auth.user.id,
        to_user: task.assignee,
        role,
        comment: role === 'director'
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

    await Promise.all([
      supabase.from('task_approval').update(resetCols).eq('task_id', taskId),
      supabase.from('task_profile').update({ revision: true }).eq('task_id', taskId),
      supabase.from('task_revision').insert({
        task_id: taskId,
        from_user: auth.user.id,
        to_user: task.assignee,
        role,
        comment,
        is_read: false,
      })
    ])
    await fetchTasks()
  }

  // ── RESUBMIT ────────────────────────────────────────────────────────────────
  const resubmitTask = async (taskId, newOutputLink) => {
    const auth = useAuthStore()
    const task = tasks.value.find(t => t.id === taskId)

    if (newOutputLink) {
      const { data: updated, error: updErr } = await supabase
        .from('task_output').update({ link: newOutputLink }).eq('task_id', taskId).select('id')
      if (updErr) throw new Error(updErr.message)
      if (!updated || updated.length === 0) {
        const { error: insErr } = await supabase
          .from('task_output').insert({ task_id: taskId, link: newOutputLink })
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
    const assigneeId = task?.assignee || auth.user.id

    await supabase.from('task_profile').update({ revision: false }).eq('task_id', taskId)

    if (revisorRole === 'director') {
      await supabase.from('task_approval')
        .update({ unit_head: true, director: false, revision_comment: null, revised_at: null })
        .eq('task_id', taskId)

      if (lastRevision?.from_user) {
        await supabase.from('task_revision').insert({
          task_id: taskId,
          from_user: auth.user.id,
          to_user: lastRevision.from_user,
          role: 'director',
          comment: '📎 Revised output resubmitted — awaiting your final approval.',
          is_read: false,
        })
      }
      await supabase.from('task_notif').upsert(
        { task_id: taskId, read_by_director: false, read_by_assignee: true, read_by_unit_head: true },
        { onConflict: 'task_id' }
      )
    } else {
      await resolveUnitIds([assigneeId])
      const assigneeIsOffice = isOfficeUser(assigneeId)
      const assignerData = await supabase.from('task').select('assigner').eq('task_id', taskId).maybeSingle()
      const isSelfAssigned = assignerData?.data?.assigner === assigneeId

      if (assigneeIsOffice || isSelfAssigned) {
        await supabase.from('task_approval')
          .update({ unit_head: true, revision_comment: null, revised_at: null })
          .eq('task_id', taskId)
      } else {
        await supabase.from('task_approval')
          .update({ revision_comment: null, revised_at: null })
          .eq('task_id', taskId)
      }

      await _notifySubmission(
        taskId, assigneeId, auth.user.id,
        '📎 Revised output resubmitted — awaiting your review.',
        isSelfAssigned
      )
    }
    await fetchTasks()
  }

  // ── FETCH REVISIONS ─────────────────────────────────────────────────────────
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
  const deleteTasks = async (taskIds) => {
    const auth = useAuthStore()
    const uid = auth.user?.id

    if (!auth.isDirector && !auth.isUnitHead) {
      throw new Error('You do not have permission to delete tasks.')
    }

    let allowedIds = [...taskIds]
    if (auth.isUnitHead && !auth.isDirector) {
      allowedIds = tasks.value
        .filter(t => taskIds.includes(t.id) && t.assigner === uid)
        .map(t => t.id)
      if (!allowedIds.length) throw new Error('You can only delete tasks that you assigned.')
    }

    const { data: subtaskRows } = await supabase
      .from('task').select('id').in('parent_ppa_id', allowedIds)
    const subtaskIds = (subtaskRows || []).map(r => r.id)

    const { data: spawnedRows } = subtaskIds.length
      ? await supabase.from('task').select('id').in('source_subtask_id', subtaskIds)
      : { data: [] }
    const spawnedIds = (spawnedRows || []).map(r => r.id)

    const allIds = [...allowedIds, ...subtaskIds, ...spawnedIds]

    const del = async (table, column, ids) => {
      if (!ids.length) return
      const { error } = await supabase.from(table).delete().in(column, ids)
      if (error) console.warn('[deleteTasks]', table, error.message)
    }

    await Promise.all([
      del('task_revision', 'task_id', allIds),
      del('task_poke', 'task_id', allIds),
      del('comment_section', 'task_id', allIds),
      del('task_notif', 'task_id', allIds),
      del('design_approval', 'id', allIds),
      del('task_output', 'id', allIds),
      del('task_approval', 'id', allIds),
      del('task_duration', 'id', allIds),
      del('task_profile', 'id', allIds)

    ])
    if (spawnedIds.length) {
      await supabase.from('task').delete().in('id', spawnedIds)
    }
    if (subtaskIds.length) {
      await supabase.from('task').delete().in('id', subtaskIds)
    }
    await supabase.from('task').delete().in('id', allowedIds)

    tasks.value = tasks.value.filter(t => !allIds.includes(t.id))
    return allowedIds.length
  }

  return {
    tasks, loading, nameMap, unitMembers,
    fetchTasks, addTasks, submitOutput,
    approveTask, requestRevision, resubmitTask, fetchRevisions,
    fetchUnitMembers, deleteTasks,
    fetchTaskById,
    // new
    editOutput, deleteOutput,
  }
})