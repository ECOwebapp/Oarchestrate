// stores/tasks.js
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const taskStore = defineStore('tasks', () => {
  const tasks   = ref([])
  const loading = ref(false)

  // ─── helpers ───────────────────────────────────────────
  const nameMap = ref({})

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

  const mapRow = (t) => ({
    id:          t.id,
    parentId:    t.parent_id,
    assigner:    t.assigner,
    assignee:    t.assignee,
    assignerName: nameMap.value[t.assigner] || '—',
    assigneeName: nameMap.value[t.assignee] || '—',
    name:        t.task_profile?.title        || '',
    description: t.task_profile?.description  || '',
    urgent:      !!t.task_profile?.urgent,
    revision:    !!t.task_profile?.revision,
    type:        t.task_profile?.task_type_ref?.task_type || '',
    typeId:      t.task_profile?.task_type    || null,
    from:        t.task_duration?.created     || null,
    to:          t.task_duration?.deadline    || null,
    startDate:   t.task_duration?.created     || null,
    endDate:     t.task_duration?.deadline    || null,
    outputLink:  t.task_output?.link          || '',
    unitHead:    !!t.task_approval?.unit_head,
    director:    !!t.task_approval?.director,
    design:      !!t.design,
    subtasks:    (t.subtasks || []).map(s => ({
      id:          s.id,
      name:        s.task_profile?.title       || '',
      description: s.task_profile?.description || '',
      urgent:      !!s.task_profile?.urgent,
      unitHead:    !!s.task_approval?.unit_head,
      director:    !!s.task_approval?.director,
      outputLink:  s.task_output?.link         || '',
      assignee:    s.assignee,
    })),
  })

  // status label helper (used by table + grid)
  const getStatus = (task) => {
    if (task.director)  return 'approved'
    if (task.unitHead)  return 'pending director'
    return 'pending unit head'
  }

  // ─── FETCH ─────────────────────────────────────────────
  const fetchTasks = async () => {
    const auth = useAuthStore()
    const uid  = auth.user?.id
    if (!uid) return
    loading.value = true

    try {
      let query = supabase
        .from('task')
        .select(`
          id, parent_id, assigner, assignee, design,
          task_profile ( title, description, urgent, revision, task_type,
            task_type_ref:task_type(task_type) ),
          task_approval ( unit_head, director ),
          task_duration ( created, deadline ),
          task_output   ( link ),
          subtasks:task!parent_id (
            id, assignee,
            task_profile ( title, description, urgent ),
            task_approval ( unit_head, director ),
            task_output   ( link )
          )
        `)
        .is('parent_id', null)

      // ── Role-based filtering ──
      if (auth.isDirector) {
        // Director sees: tasks assigned BY them OR tasks fully approved by unit head
        // PostgREST can't do OR across related tables easily, so fetch both and merge
        const [mine, approved] = await Promise.all([
          supabase.from('task').select(`id,parent_id,assigner,assignee,design,
            task_profile(title,description,urgent,revision,task_type,task_type_ref:task_type(task_type)),
            task_approval(unit_head,director),task_duration(created,deadline),task_output(link),
            subtasks:task!parent_id(id,assignee,task_profile(title,description,urgent),task_approval(unit_head,director),task_output(link))
          `).is('parent_id',null).eq('assigner', uid),

          supabase.from('task').select(`id,parent_id,assigner,assignee,design,
            task_profile(title,description,urgent,revision,task_type,task_type_ref:task_type(task_type)),
            task_approval(unit_head,director),task_duration(created,deadline),task_output(link),
            subtasks:task!parent_id(id,assignee,task_profile(title,description,urgent),task_approval(unit_head,director),task_output(link))
          `).is('parent_id',null).eq('task_approval.unit_head', true),
        ])
        const seen = new Set()
        const rows = [...(mine.data||[]), ...(approved.data||[])]
          .filter(t => { if (seen.has(t.id)) return false; seen.add(t.id); return true })
        await resolveNames([...new Set(rows.flatMap(t => [t.assigner, t.assignee]).filter(Boolean))])
        tasks.value = rows.map(mapRow)

      } else if (auth.isUnitHead) {
        // Unit head sees: their own tasks + tasks assigned TO members under them (same unit)
        const { data: rows } = await query.or(`assigner.eq.${uid},assignee.eq.${uid}`)
        await resolveNames([...new Set((rows||[]).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))])
        tasks.value = (rows||[]).map(mapRow)

      } else {
        // Member sees only their own tasks
        const { data: rows } = await query.eq('assignee', uid)
        await resolveNames([...new Set((rows||[]).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))])
        tasks.value = (rows||[]).map(mapRow)
      }
    } catch(e) {
      console.error('[taskStore] fetchTasks:', e)
    } finally {
      loading.value = false
    }
  }

  // ─── ADD TASK ──────────────────────────────────────────
  const addTasks = async ({ mainTask, subTasks = [] }) => {
    const auth = useAuthStore()
    const uid  = auth.user?.id

    // Insert parent task
    const { data: taskRow, error: taskErr } = await supabase
      .from('task')
      .insert({ assigner: uid, assignee: mainTask.assignee, design: !!mainTask.design })
      .select('id')
      .single()
    if (taskErr) throw taskErr

    const taskId = taskRow.id

    // Parallel inserts for all related rows
    const inserts = [
      supabase.from('task_profile').insert({
        id:          taskId,
        title:       mainTask.name,
        description: mainTask.description,
        task_type:   mainTask.type,
        urgent:      !!mainTask.urgent,
        revision:    false,
      }),
      supabase.from('task_approval').insert({
        id:        taskId,
        // Director adding task = auto unit-head approved, pending director
        // Unit head adding task = pending unit head approval
        // Member adding task = pending unit head approval
        unit_head: auth.isDirector ? true : false,
        director:  false,
      }),
      supabase.from('task_duration').insert({
        id:       taskId,
        created:  new Date().toISOString().split('T')[0],
        deadline: mainTask.endDate,
      }),
      supabase.from('task_output').insert({ id: taskId, link: mainTask.outputLink || '' }),
    ]
    await Promise.all(inserts)

    // Insert subtasks
    for (const sub of subTasks.filter(s => s.description?.trim())) {
      const { data: subRow } = await supabase
        .from('task')
        .insert({ assigner: uid, assignee: mainTask.assignee, parent_id: taskId })
        .select('id').single()
      if (!subRow) continue
      await Promise.all([
        supabase.from('task_profile').insert({ id: subRow.id, title: sub.description, description: sub.description, task_type: mainTask.type, urgent: false }),
        supabase.from('task_approval').insert({ id: subRow.id, unit_head: auth.isDirector, director: false }),
        supabase.from('task_duration').insert({ id: subRow.id, created: new Date().toISOString().split('T')[0], deadline: mainTask.endDate }),
        supabase.from('task_output').insert({ id: subRow.id, link: '' }),
      ])
    }

    await fetchTasks()
  }

  // ─── APPROVE (unit head → director, or director final) ─
  const approveTask = async (taskId, role) => {
    const col = role === 'director' ? 'director' : 'unit_head'
    await supabase.from('task_approval').update({ [col]: true }).eq('id', taskId)
    await fetchTasks()
  }

  // ─── REVISE ────────────────────────────────────────────
  const reviseTask = async (taskId) => {
    await supabase.from('task_approval').update({ unit_head: false }).eq('id', taskId)
    await fetchTasks()
  }

  // ─── SUBMIT OUTPUT LINK ────────────────────────────────
  const submitOutput = async (taskId, link) => {
    await supabase.from('task_output').update({ link }).eq('id', taskId)
    await fetchTasks()
  }

  return { tasks, loading, nameMap, getStatus, fetchTasks, addTasks, approveTask, reviseTask, submitOutput }
})