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
    ppa:          '',
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

function printReport() {
  const prev = document.title
  document.title = ' '
  setTimeout(() => {
    window.print()
    document.title = prev
  }, 50)
}

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
      const tasks = g.tasks.filter(t => inPeriod(t) && t.mov)
      return { ...g, tasks, rowspan: tasks.length }
    })
    .filter(g => g.tasks.length > 0)
})

const today = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })

// Expand tasks into one row per subtask for rendering
const flatRows = computed(() => {
  const rows = []
  for (const grp of programs.value) {
    const unitRowspan = grp.tasks.reduce((sum, t) => sum + Math.max(1, (t.subtaskNames || []).length), 0)
    let unitRendered = false
    for (const task of grp.tasks) {
      const subs = (task.subtaskNames || []).length > 0 ? task.subtaskNames : ['']
      let taskRendered = false
      for (let si = 0; si < subs.length; si++) {
        rows.push({
          showUnit:     !unitRendered,
          unitRowspan,
          unitName:     grp.unitName,
          showTask:     !taskRendered,
          taskRowspan:  subs.length,
          taskName:     task.name,
          subtaskName:  subs[si],
          assignedTo:   task.assignedTo,
          startDate:    task.startDate,
          endDate:      task.endDate,
          mov:          task.mov,
          isLastInUnit: false,
        })
        unitRendered = true
        taskRendered = true
      }
    }
    if (rows.length > 0) rows[rows.length - 1].isLastInUnit = true
  }
  return rows
})

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

    <div id="unit-report-printable" class="relative bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden"
      style="width: 1360px; max-width: 98vw; max-height: 92vh;">

      <!-- Close -->
      <button
        class="absolute top-3 right-3 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-all cursor-pointer text-base leading-none print:hidden"
        @click="emit('close')">×</button>

      <!-- Print -->
      <button @click="printReport"
        class="absolute top-3 right-12 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-900 text-white text-[11px] font-semibold hover:bg-green-700 transition-colors cursor-pointer print:hidden">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print
      </button>

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
            <tr class="bg-green-900 text-white text-[9px] uppercase tracking-normal">
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:10%">Unit</th>
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:18%">Tasks</th>
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:20%">Subtasks</th>
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:14%">Assigned Personnel</th>
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:8%">Start Date</th>
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:8%">Due Date</th>
              <th class="px-1 py-1.5 font-semibold text-center border-r border-green-700 whitespace-nowrap" style="width:14%">MOVs</th>
              <th class="px-1 py-1.5 font-semibold text-center whitespace-nowrap" style="width:8%">Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="flatRows.length === 0">
              <td colspan="8" class="text-center py-10 text-gray-400 text-sm italic">No approved tasks found for {{ periodLabel }}.</td>
            </tr>
            <tr v-for="(row, i) in flatRows" :key="i"
              :class="[row.isLastInUnit ? 'border-b-2 border-gray-400' : 'border-b border-gray-100', 'hover:bg-green-50/30 bg-white']">

              <!-- Unit -->
              <td v-if="row.showUnit" :rowspan="row.unitRowspan"
                class="border-r-2 border-gray-300 align-middle text-center bg-green-900/5 px-2 py-2">
                <span class="font-bold text-green-900 text-[10px] leading-tight">{{ row.unitName }}</span>
              </td>

              <!-- Task (spans subtask rows) -->
              <td v-if="row.showTask" :rowspan="row.taskRowspan"
                class="px-3 py-2 text-gray-800 border-r border-gray-200 align-top font-semibold text-[10px]">
                {{ row.taskName }}
              </td>

              <!-- Subtask -->
              <td class="px-3 py-2 text-gray-700 border-r border-gray-200 align-top text-[10px]">{{ row.subtaskName }}</td>

              <!-- Assigned Personnel -->
              <td class="px-3 py-2 text-center border-r border-gray-200 align-top">
                <div class="flex flex-col gap-0.5 items-center">
                  <span v-for="person in row.assignedTo" :key="person"
                    class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-900 text-white leading-tight whitespace-nowrap">
                    {{ person }}
                  </span>
                </div>
              </td>

              <!-- Start Date (spans task rows) -->
              <td v-if="row.showTask" :rowspan="row.taskRowspan"
                class="px-3 py-2 text-center text-gray-500 border-r border-gray-200 whitespace-nowrap align-middle text-[10px]">
                {{ row.startDate }}
              </td>

              <!-- Due Date (spans task rows) -->
              <td v-if="row.showTask" :rowspan="row.taskRowspan"
                class="px-3 py-2 text-center text-gray-500 border-r border-gray-200 whitespace-nowrap align-middle text-[10px]">
                {{ row.endDate }}
              </td>

              <!-- MOVs (spans task rows) -->
              <td v-if="row.showTask" :rowspan="row.taskRowspan"
                class="px-2 py-2 border-r border-gray-200 align-top">
                <a v-if="row.mov" :href="row.mov.url" target="_blank" rel="noopener"
                  class="text-[9px] text-blue-700 underline break-all hover:text-blue-900 transition-colors">
                  {{ row.mov.url }}
                </a>
                <span v-else class="text-gray-300 text-[9px]">No file</span>
              </td>

              <!-- Remarks (spans task rows) -->
              <td v-if="row.showTask" :rowspan="row.taskRowspan"
                class="px-3 py-2 text-center text-[10px] text-gray-600 font-medium align-middle">
                Approved
              </td>
            </tr>
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
          <div class="text-center w-48">
            <div class="h-8 border-b border-gray-400 mb-1"></div>
            <p class="text-[11px] text-gray-500 font-medium">Noted by</p>
            <p class="text-[10px] text-gray-400">Signature over printed name</p>
          </div>
        </div>
        <p class="text-[8px] text-gray-300/60 italic select-none pointer-events-none text-left">System-generated on {{ today }}. Do not alter.</p>
      </div>

    </div>
  </div>
</template>

<style>
@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }

  body { visibility: hidden; }

  #unit-report-printable,
  #unit-report-printable * { visibility: visible; }

  #unit-report-printable {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    max-width: 100%;
    max-height: none !important;
    overflow: visible !important;
    box-shadow: none;
    border-radius: 0;
    padding: 8mm 10mm;
    font-family: Arial, sans-serif;
  }

  #unit-report-printable .overflow-auto {
    overflow: visible !important;
    max-height: none !important;
  }

  /* ── Table ── */
  #unit-report-printable table {
    border-collapse: collapse !important;
    width: 100% !important;
    table-layout: auto !important;
  }

  #unit-report-printable thead {
    display: table-header-group !important;
  }

  #unit-report-printable th,
  #unit-report-printable td {
    border: 1px solid #5a5a5a !important;
    word-break: break-word !important;
    overflow-wrap: break-word !important;
    white-space: normal !important;
    vertical-align: middle !important;
    font-size: 7pt !important;
    padding: 4px 5px !important;
    color: #111 !important;
    background: white !important;
  }

  /* Header row */
  #unit-report-printable thead th {
    white-space: nowrap !important;
    font-size: 7pt !important;
    padding: 5px 4px !important;
    background: #1a4731 !important;
    color: white !important;
    text-align: center !important;
    font-weight: bold !important;
    letter-spacing: 0 !important;
  }

  /* Unit name cell — horizontal, clean */
  #unit-report-printable td[rowspan] {
    writing-mode: horizontal-tb !important;
    transform: none !important;
    text-align: center !important;
    vertical-align: middle !important;
    font-weight: bold !important;
    font-size: 7.5pt !important;
    background: #e8f5e9 !important;
    color: #1a4731 !important;
  }

  #unit-report-printable td[rowspan] span {
    writing-mode: horizontal-tb !important;
    transform: none !important;
    white-space: normal !important;
  }

  /* Strip badge/pill styling — show plain text */
  #unit-report-printable td span,
  #unit-report-printable td a {
    background: none !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    color: #111 !important;
    font-size: 7pt !important;
    font-weight: normal !important;
    display: inline !important;
  }

  #unit-report-printable td a {
    text-decoration: underline !important;
    color: #1a4731 !important;
  }

  /* Even rows: light stripe */
  #unit-report-printable tbody tr:nth-child(even) td {
    background: #f9fafb !important;
  }

  /* Keep rows together */
  #unit-report-printable tr {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  /* ── Sticky header → static in print ── */
  #unit-report-printable .sticky {
    position: static !important;
  }

  /* ── Footer signature area ── */
  #unit-report-printable .flex-shrink-0.border-t {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
    padding: 6mm 0 0 0 !important;
    border-top: 1px solid #aaa !important;
    margin-top: 6mm !important;
  }

  #unit-report-printable .flex-shrink-0.border-t .flex {
    display: flex !important;
    justify-content: space-between !important;
  }

  #unit-report-printable .flex-shrink-0.border-t p {
    font-size: 7pt !important;
    color: #333 !important;
  }

  #unit-report-printable .flex-shrink-0.border-t .border-b {
    border-bottom: 1px solid #333 !important;
    margin-bottom: 3px !important;
  }

  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>

