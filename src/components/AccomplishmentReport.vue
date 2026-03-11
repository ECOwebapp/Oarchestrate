<script setup>
import { computed, ref, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient.js'
import { useAuthStore } from '@/stores/useAuthStore.js'

const props = defineProps({ show: Boolean, month: { default: () => new Date().getMonth() + 1 }, year: { default: () => new Date().getFullYear() } })
const emit = defineEmits(['close'])

const auth = useAuthStore()

// allTasks: array of { unitName, unitId, tasks[] }
const unitGroups = ref([])

const loadAllTasks = async () => {
  // 1. Fetch all units with their names
  const { data: unitRows } = await supabase
    .from('unit')
    .select('user_id, unit_id, unit_name_ref:unit_name(name)')
    .order('unit_id')

  if (!unitRows || !unitRows.length) { unitGroups.value = []; return }

  // 2. Build unit_id → unit name map, and unit_id → [user_ids]
  const unitNameMap = {}
  const unitMemberMap = {}
  for (const row of unitRows) {
    const uid  = row.unit_id
    const name = row.unit_name_ref?.name || `Unit ${uid}`
    unitNameMap[uid] = name
    if (!unitMemberMap[uid]) unitMemberMap[uid] = []
    if (row.user_id) unitMemberMap[uid].push(row.user_id)
  }

  // Build reverse map: user_id → unit_id (a user belongs to one unit)
  const userUnitMap = {}
  for (const row of unitRows) {
    if (row.user_id) userUnitMap[row.user_id] = row.unit_id
  }

  // If not director, restrict to own unit only
  const allowedUnitIds = auth.isDirector
    ? Object.keys(unitMemberMap).map(Number)
    : [auth.unitId]

  const allMemberIds = allowedUnitIds.flatMap(uid => unitMemberMap[uid] || [])
  if (!allMemberIds.length) { unitGroups.value = []; return }

  // 3. Fetch approved tasks for those members
  const assigneeFilter = allMemberIds.map(id => `assignee.eq.${id}`).join(',')
  const { data } = await supabase
    .from('task')
    .select(`
      id, parent_id, assignee,
      task_profile ( title, task_type_ref:task_type(task_type) ),
      task_approval ( unit_head, director ),
      task_duration ( created, deadline ),
      task_output   ( link ),
      subtasks:task!parent_id ( id, task_profile(title) )
    `)
    .is('parent_id', null)
    .or(assigneeFilter)
    .order('id')

  if (!data || !data.length) { unitGroups.value = []; return }

  // 4. Filter to approved only (unit_head OR director approved)
  const approved = data.filter(t => t.task_approval?.unit_head || t.task_approval?.director)

  // 5. Resolve names
  const uids = [...new Set(approved.map(t => t.assignee).filter(Boolean))]
  const nameMap = {}
  if (uids.length) {
    const { data: profiles } = await supabase
      .from('user_profile').select('user_id, fname, lname').in('user_id', uids)
    ;(profiles || []).forEach(p => {
      nameMap[p.user_id] = `${p.fname || ''} ${p.lname || ''}`.trim()
    })
  }

  const FMT = { month: 'short', day: 'numeric', year: 'numeric' }
  const fmt = (s) => { const d = new Date(s); return isNaN(d) ? '—' : d.toLocaleDateString('en-PH', FMT) }
  const durDays = (s, e) => {
    const sd = new Date(s), ed = new Date(e)
    return (isNaN(sd) || isNaN(ed)) ? '—' : Math.max(1, Math.ceil((ed - sd) / 86400000))
  }
  const progressOf = (t) => {
    if (t.task_approval?.director)  return 100
    if (t.task_approval?.unit_head) return 75
    if (t.task_output?.link)        return 50
    return 25
  }

  // 6. Map rows
  const mapped = approved.map(t => ({
    id:           t.id,
    unitId:       userUnitMap[t.assignee] || null,
    name:         t.task_profile?.title || '',
    type:         t.task_profile?.task_type_ref?.task_type || 'General',
    assignee:     t.assignee,
    assigneeName: nameMap[t.assignee] || '—',
    startDate:    fmt(t.task_duration?.created),
    endDate:      fmt(t.task_duration?.deadline),
    duration:     durDays(t.task_duration?.created, t.task_duration?.deadline),
    progress:     progressOf(t),
    subtaskNames: (t.subtasks || []).map(s => s.task_profile?.title || '').filter(Boolean),
    mov:          t.task_output?.link ? { label: 'View Output', url: t.task_output.link } : null,
    rawStart:     t.task_duration?.created  || null,
    rawEnd:       t.task_duration?.deadline || null,
  }))

  // 7. Group by unit → then by task title (merge multiple assignees into one row)
  const unitTaskMap = {}
  for (const uid of allowedUnitIds) {
    unitTaskMap[uid] = {}
  }
  for (const t of mapped) {
    const uid = t.unitId
    if (!unitTaskMap[uid]) continue
    const key = t.name || '(Untitled)'
    if (!unitTaskMap[uid][key]) {
      unitTaskMap[uid][key] = { ...t, assignedTo: [] }
    }
    unitTaskMap[uid][key].assignedTo.push(t.assigneeName)
  }

  unitGroups.value = allowedUnitIds
    .map(uid => ({
      unitId:   uid,
      unitName: unitNameMap[uid] || `Unit ${uid}`,
      tasks:    Object.values(unitTaskMap[uid] || {}),
    }))
    .filter(g => g.tasks.length > 0)
}

watch(() => props.show, (val) => { if (val) loadAllTasks() }, { immediate: true })

// ── Filtered by selected period ──────────────────────────
const programs = computed(() => {
  const mo = +props.month
  const yr = +props.year

  const inPeriod = (t) => {
    const check = (s) => {
      if (!s) return false
      const d = new Date(s)
      return !isNaN(d) && d.getFullYear() === yr && (mo === 0 || d.getMonth() + 1 === mo)
    }
    return check(t.rawStart) || check(t.rawEnd)
  }

  return unitGroups.value
    .map(g => {
      const tasks = g.tasks.filter(inPeriod)
      return { ...g, tasks, rowspan: tasks.length }
    })
    .filter(g => g.tasks.length > 0)
})

const today = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const periodLabel = computed(() => {
  const mo = +props.month
  const yr = +props.year
  return mo === 0 ? `Year ${yr}` : `${MONTHS[mo - 1]} ${yr}`
})
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    @click.self="emit('close')">

    <div class="relative bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden"
      style="width: 1360px; max-width: 98vw; max-height: 92vh;">

      <!-- Top accent bar -->
      <div class="h-1 w-full bg-gradient-to-r from-green-900 to-emerald-500 flex-shrink-0"></div>

      <!-- Close -->
      <button
        class="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-all cursor-pointer text-base leading-none"
        @click="emit('close')">×</button>

      <!-- ── Header ── -->
      <div class="relative flex-shrink-0 px-8 pt-6 pb-5 border-b border-gray-100">
        <img src="/images/csu.png" alt=""
          class="absolute right-8 top-1/2 -translate-y-1/2 h-20 opacity-[0.06] pointer-events-none select-none" />
        <div class="flex flex-col items-center">
          <img src="/images/csu_seal.png" alt="" class="w-12 h-12 object-contain mb-2"
            onerror="this.style.display='none'" />
          <p class="text-[10px] font-bold tracking-[0.15em] text-green-700 uppercase">Caraga State University</p>
          <h1 class="text-xl font-bold text-gray-900">Unit Accomplishment Report</h1>
          <p class="text-[13px] text-gray-500 tracking-wide mt-0.5">Engineering and Construction Office</p>
          <p class="text-[11px] text-green-800 font-semibold mt-1">{{ periodLabel }}</p>
        </div>
      </div>

      <!-- ── Table ── -->
      <div class="overflow-auto flex-1">
        <table class="w-full text-xs border-collapse">
          <thead class="sticky top-0 z-10">
            <tr class="bg-green-900 text-white text-[11px] uppercase tracking-wide">
              <th class="px-3 py-3 font-semibold text-center w-28 border-r border-green-700">Unit</th>
              <th class="px-3 py-3 font-semibold text-center w-8 border-r border-green-700">#</th>
              <th class="px-4 py-3 font-semibold text-center border-r border-green-700">Task / Activity</th>
              <th class="px-3 py-3 font-semibold text-center w-28 border-r border-green-700">PPAs</th>
              <th class="px-3 py-3 font-semibold text-center w-32 border-r border-green-700">Assigned Personnel</th>
              <th class="px-3 py-3 font-semibold text-center w-24 border-r border-green-700">Start Date</th>
              <th class="px-3 py-3 font-semibold text-center w-24 border-r border-green-700">Due Date</th>
              <th class="px-3 py-3 font-semibold text-center w-16 border-r border-green-700">Duration</th>
              <th class="px-3 py-3 font-semibold text-center w-28 border-r border-green-700">Approval Status</th>
              <th class="px-3 py-3 font-semibold text-center w-36 border-r border-green-700">MOVs</th>
              <th class="px-3 py-3 font-semibold text-center w-24">Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="programs.length === 0">
              <td colspan="11" class="text-center py-10 text-gray-400 text-sm italic">No approved tasks found for {{ periodLabel }}.</td>
            </tr>
            <template v-for="(grp, gi) in programs" :key="gi">
              <tr v-for="(task, ti) in grp.tasks" :key="ti"
                :class="[
                  ti === grp.tasks.length - 1 ? 'border-b-2 border-gray-300' : 'border-b border-gray-100',
                  'hover:bg-green-50/30 transition-colors bg-white'
                ]">

                <!-- PPAs = Unit Name — spans all rows of that unit -->
                <td v-if="ti === 0" :rowspan="grp.rowspan"
                  class="border-r-2 border-gray-300 border-b-2 align-middle text-center bg-green-900/5">
                  <div class="flex items-center justify-center h-full px-2 py-3">
                    <span class="font-bold text-green-900 text-[11px] tracking-wide leading-tight text-center"
                      style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap;">
                      {{ grp.unitName }}
                    </span>
                  </div>
                </td>

                <!-- # -->
                <td class="px-3 py-2 text-center text-gray-400 font-semibold border-r border-gray-200 align-middle bg-gray-50">{{ ti + 1 }}</td>

                <!-- Task / Activity -->
                <td class="px-4 py-3 font-semibold text-gray-800 border-r border-gray-200 align-top leading-snug">{{ task.name }}</td>

                <!-- PPAs -->
                <td class="px-3 py-2 text-center border-r border-gray-200">
                  <span class="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-800 border border-green-200">
                    {{ task.type || '—' }}
                  </span>
                </td>

                <!-- Assigned Personnel -->
                <td class="px-3 py-2 text-center border-r border-gray-200">
                  <div class="flex flex-col gap-0.5 items-center">
                    <span v-for="person in task.assignedTo" :key="person"
                      class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-900 text-white leading-tight whitespace-nowrap">
                      {{ person }}
                    </span>
                  </div>
                </td>

                <!-- Start Date -->
                <td class="px-3 py-2 text-center text-gray-500 border-r border-gray-200 whitespace-nowrap">{{ task.startDate }}</td>

                <!-- Due Date -->
                <td class="px-3 py-2 text-center text-gray-500 border-r border-gray-200 whitespace-nowrap">{{ task.endDate }}</td>

                <!-- Duration -->
                <td class="px-3 py-2 text-center border-r border-gray-200">
                  <span class="text-gray-700 font-medium">{{ task.duration }}</span>
                  <span class="text-gray-400 text-[9px] ml-0.5">day{{ task.duration === 1 ? '' : 's' }}</span>
                </td>

                <!-- Approval Status -->
                <td class="px-3 py-2 text-center border-r border-gray-200">
                  <span v-if="task.progress === 100"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Director Approved
                  </span>
                  <span v-else
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                    <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    Unit Head Approved
                  </span>
                </td>

                <!-- MOVs -->
                <td class="px-3 py-2 text-center border-r border-gray-200">
                  <a v-if="task.mov" :href="task.mov.url" target="_blank" rel="noopener"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors max-w-[130px] truncate">
                    <svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    View Output
                  </a>
                  <span v-else class="text-gray-300 text-[10px]">No file</span>
                </td>

                <!-- Remarks -->
                <td class="px-3 py-2 text-center text-[10px] text-gray-400">{{ task.progress === 100 ? 'Accomplished' : 'For Director Approval' }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- ── Generated Notice ── -->

      <!-- ── Footer ── -->
      <div class="flex-shrink-0 border-t border-gray-100 px-10 pt-5 pb-3 bg-white">
        <div class="flex justify-between items-end mb-3">
          <div class="text-center w-48">
            <div class="h-8 border-b border-gray-400 mb-1"></div>
            <p class="text-[11px] text-gray-500 font-medium">Prepared by</p>
            <p class="text-[10px] text-gray-400">Signature over printed name</p>
          </div>
          <div class="text-[10px] text-gray-400 text-center space-y-0.5">
            <p>Total approved: <span class="font-semibold text-emerald-600">{{ programs.reduce((a, g) => a + g.tasks.length, 0) }}</span></p>
            <p>Director approved: <span class="font-semibold text-green-700">{{ programs.reduce((a, g) => a + g.tasks.filter(t => t.progress === 100).length, 0) }}</span></p>
            <p>Unit head approved: <span class="font-semibold text-yellow-600">{{ programs.reduce((a, g) => a + g.tasks.filter(t => t.progress === 75).length, 0) }}</span></p>
          </div>
          <div class="text-center w-48">
            <div class="h-8 border-b border-gray-400 mb-1"></div>
            <p class="text-[11px] text-gray-500 font-medium">Noted by</p>
            <p class="text-[10px] text-gray-400">Signature over printed name</p>
          </div>
        </div>
        <p class="text-[9px] text-gray-300 italic select-none pointer-events-none text-left">System-generated on {{ today }}. Do not alter.</p>
      </div>

    </div>
  </div>
</template>

