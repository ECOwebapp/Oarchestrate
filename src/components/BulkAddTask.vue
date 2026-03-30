<script setup vapor>
import { useMemberStore } from '@/stores/member'
import { usePosStore } from '@/stores/positions'
import { taskStore } from '@/stores/tasks'
import { useUnitStore } from '@/stores/unit'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed, onMounted, ref } from 'vue'
import * as XLSX from 'xlsx'

const emit = defineEmits(['close'])

// ── Stores ────────────────────────────────────────────────────────────────────
const memberStore = useMemberStore()
const posStore = usePosStore()
const store = taskStore()
const auth = useAuthStore()
const unitStore = useUnitStore()

// ── State ─────────────────────────────────────────────────────────────────────
const activeTab = ref('paste')   // 'paste' | 'excel'
const rawInput = ref('')
const parsedTasks = ref([])
const expanded = ref({})
const submitting = ref(false)
const errorMsg = ref('')
const fileStatus = ref('')
const isDragging = ref(false)
const successCount = ref(0)
const done = ref(false)

// ── Bootstrap ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([
    memberStore.fetchMembers(),
    posStore.fetchMemberPos(),
    posStore.fetchPos(),
    unitStore.fetchUnit(),
  ])
})

// ── Unit-code → user_id resolution ───────────────────────────────────────────
// Builds { "TOOU": unitId, "PDU": unitId, … } from unitStore.unit.
// Falls back to deriving an abbreviation from the unit name's initials.
const unitCodeMap = computed(() => {
  const map = {}
  for (const u of (unitStore.unit || [])) {
    const id = u.id ?? u.unit_id
    const abbr = (u.unit_abbreviation || u.abbreviation || '').toUpperCase()
    if (abbr) map[abbr] = id
    if (u.unit_name) {
      map[u.unit_name.toUpperCase()] = id
      // Derived initials abbreviation e.g. "Technology Office Operations Unit" → "TOOU"
      const derived = u.unit_name.split(/\s+/).map(w => w[0]).join('').toUpperCase()
      if (derived) map[derived] = id
    }
  }
  return map
})

const resolveAssigneeId = (code) => {
  if (!code) return null
  const key = code.trim().toUpperCase()
  const unitId = unitCodeMap.value[key]
  if (!unitId) return null
  // Prefer unit head (pos_id 4) in that unit, else first member found
  const inUnit = posStore.memberPos.filter(p => String(p.unit_id) === String(unitId))
  const head = inUnit.find(p => p.pos_id === 4)
  const pick = head || inUnit[0]
  return pick?.user_id || null
}

// ── Assignable members for manual override dropdowns ─────────────────────────
const assignableMembers = computed(() => {
  const allMembers = memberStore.members || []
  const allPositions = posStore.memberPos || []
  const ALLOWED = new Set(['2', '3', '4', '12'])

  if (!auth.isDirector) return []

  const allowedIds = new Set(
    allPositions
      .filter(p => ALLOWED.has(String(p.pos_id)))
      .map(p => String(p.user_id))
  )
  return allMembers.filter(m => allowedIds.has(String(m.id)))
})

const memberLabel = (m) =>
  [m.fname, m.middle_initial ? m.middle_initial + '.' : '', m.lname].filter(Boolean).join(' ')

// ── Type options ──────────────────────────────────────────────────────────────
const typeOptions = [
  { id: 1, label: 'Regular Task' },
  { id: 2, label: 'Insertion Task' },
]

// ── Date normalizer ───────────────────────────────────────────────────────────
const fmtDate = (raw) => {
  if (!raw) return ''
  const s = String(raw).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m1) return `${m1[3]}-${m1[2].padStart(2, '0')}-${m1[1].padStart(2, '0')}`
  if (!isNaN(Number(s)) && Number(s) > 1000) {
    try {
      const d = XLSX.SSF.parse_date_code(Number(s))
      if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
    } catch (_) { /* ignore */ }
  }
  return s
}

const normRow = (cells) => ({
  name: String(cells[0] || '').trim(),
  assignee: String(cells[1] || '').trim(),
  start: fmtDate(cells[2]),
  end: fmtDate(cells[3]),
  color: String(cells[4] || '').trim(),
})

const isHeaderRow = (r) => r.name && !r.end && !r.start && !r.assignee

// ── Core parser: rows → task tree ─────────────────────────────────────────────
const rowsToTaskList = (rows) => {
  const groups = []
  let current = null

  for (const row of rows) {
    if (!row.name) continue

    if (isHeaderRow(row)) {
      if (current) groups.push(current)
      current = {
        ...row, subTasks: [], urgent: false, type: 1, description: '',
        resolvedAssigneeId: null,
      }
      continue
    }

    if (!current) {
      groups.push({
        ...row, subTasks: [], urgent: false, type: 1, description: '',
        resolvedAssigneeId: resolveAssigneeId(row.assignee),
      })
    } else if (!current.end && !current.start) {
      // First data row below a header: fills in the parent's metadata
      current.assignee = row.assignee
      current.start = row.start
      current.end = row.end
      current.color = row.color
      current.resolvedAssigneeId = resolveAssigneeId(row.assignee)
      groups.push(current)
      current = null
    } else {
      current.subTasks.push({
        name: row.name, assignee: row.assignee,
        start: row.start, end: row.end, color: row.color,
        resolvedAssigneeId: resolveAssigneeId(row.assignee),
      })
    }
  }
  if (current) groups.push(current)

  return groups.map(t => ({
    ...t,
    resolvedAssigneeId: t.resolvedAssigneeId || resolveAssigneeId(t.assignee) || null,
  }))
}

// ── Text parse ────────────────────────────────────────────────────────────────
const parseText = () => {
  errorMsg.value = ''
  if (!rawInput.value.trim()) { errorMsg.value = 'Please paste some data first.'; return }
  try {
    const lines = rawInput.value.trim().split('\n').filter(l => l.trim())
    const rows = lines.map(l => normRow(l.split('\t')))
    parsedTasks.value = rowsToTaskList(rows)
    if (!parsedTasks.value.length) { errorMsg.value = 'No tasks found. Check your format.'; return }
    expanded.value = {}
    done.value = false
  } catch (e) {
    errorMsg.value = 'Parse error: ' + e.message
  }
}

// ── File parse (Excel / CSV) ──────────────────────────────────────────────────
const handleFile = (file) => {
  if (!file) return
  fileStatus.value = 'Reading ' + file.name + '…'
  errorMsg.value = ''
  const reader = new FileReader()

  if (file.name.toLowerCase().endsWith('.csv')) {
    reader.onload = e => {
      const lines = e.target.result.trim().split('\n')
      // Skip header row if first cell looks like a column label
      const start = /name|task|title/i.test(lines[0]?.split(',')[0] || '') ? 1 : 0
      const rows = lines.slice(start).map(l => normRow(l.split(',')))
      parsedTasks.value = rowsToTaskList(rows)
      fileStatus.value = ''
      expanded.value = {}
      done.value = false
    }
    reader.readAsText(file)
  } else {
    reader.onload = e => {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: false })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
      const start = (raw[0] || []).some(c => /name|task|title/i.test(String(c))) ? 1 : 0
      const rows = raw.slice(start).map(r => normRow(r))
      parsedTasks.value = rowsToTaskList(rows)
      fileStatus.value = ''
      expanded.value = {}
      done.value = false
    }
    reader.readAsArrayBuffer(file)
  }
}

const handleDrop = (e) => { e.preventDefault(); isDragging.value = false; handleFile(e.dataTransfer.files[0]) }
const handleFileInput = (e) => handleFile(e.target.files[0])

// ── Card helpers ──────────────────────────────────────────────────────────────
const toggleExpand = (i) => { expanded.value = { ...expanded.value, [i]: !expanded.value[i] } }
const addSubTask = (ti) => parsedTasks.value[ti].subTasks.push({ name: '', assignee: '', end: '' })
const removeSubTask = (ti, si) => parsedTasks.value[ti].subTasks.splice(si, 1)
const removeTask = (ti) => parsedTasks.value.splice(ti, 1)

// ── Validate ──────────────────────────────────────────────────────────────────
const validate = () => {
  const noTitle = parsedTasks.value.filter(t => !t.name?.trim())
  const noDeadline = parsedTasks.value.filter(t => !t.end)
  const noAssignee = parsedTasks.value.filter(t => !t.resolvedAssigneeId)

  if (noTitle.length) {
    errorMsg.value = `${noTitle.length} task(s) are missing a title.`; return false
  }
  if (noDeadline.length) {
    errorMsg.value = `${noDeadline.length} task(s) are missing a deadline.`; return false
  }
  if (noAssignee.length) {
    errorMsg.value = `${noAssignee.length} task(s) have an unresolved assignee — please select one manually.`
    return false
  }
  return true
}

// ── Submit ────────────────────────────────────────────────────────────────────
const submitAll = async () => {
  errorMsg.value = ''
  if (!validate()) return

  submitting.value = true
  successCount.value = 0

  try {
    for (const task of parsedTasks.value) {
      const validSubs = (task.subTasks || [])
        .filter(s => s.name?.trim())
        .map(s => ({ description: s.name.trim() }))

      await store.addTasks({
        mainTask: {
          name: task.name.trim(),
          description: (task.description || '').trim(),
          type: task.type || 1,
          endDate: task.end,
          urgent: !!task.urgent,
          design: false,
          assignee: task.resolvedAssigneeId,
          outputLink: '',
        },
        subTasks: validSubs,
      })
      successCount.value++
    }
    done.value = true
  } catch (e) {
    console.error('[BulkAddTask] submitAll error:', e)
    errorMsg.value = e.message || 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

const clearAll = () => {
  parsedTasks.value = []
  rawInput.value = ''
  errorMsg.value = ''
  fileStatus.value = ''
  expanded.value = {}
  done.value = false
  successCount.value = 0
}

// ── Color dot ─────────────────────────────────────────────────────────────────
const COLOR_MAP = {
  green: '#16a34a', blue: '#2563eb', red: '#dc2626',
  amber: '#d97706', purple: '#7c3aed', gray: '#6b7280',
}
const dotColor = (c) => COLOR_MAP[(c || '').toLowerCase()] || '#6b7280'
</script>

<template>
  <div class="bg-white w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

    <!-- Header -->
    <div class="flex items-center justify-between px-7 py-5 border-b border-gray-100">
      <div>
        <h2 class="text-xl font-bold text-gray-900">Bulk Add Tasks</h2>
        <p class="text-xs text-gray-400 mt-0.5">Paste tab-separated data or upload an Excel / CSV file</p>
      </div>
      <button @click="emit('close')"
        class="text-gray-400 hover:text-gray-700 text-2xl leading-none hover:cursor-pointer">×</button>
    </div>

    <!-- ── Success state ─────────────────────────────────────────────────────── -->
    <div v-if="done" class="flex-1 flex flex-col items-center justify-center gap-4 px-7 py-12">
      <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
        <svg class="w-8 h-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p class="text-lg font-semibold text-gray-800">
        {{ successCount }} task{{ successCount !== 1 ? 's' : '' }} added successfully
      </p>
      <div class="flex gap-3 mt-2">
        <button @click="clearAll" class="px-5 py-2 rounded-xl border-2 border-gray-300 text-gray-600 text-sm font-semibold
                 hover:border-green-800 hover:text-green-800 transition-colors hover:cursor-pointer">
          Add more
        </button>
        <button @click="emit('close')" class="px-5 py-2 rounded-xl bg-green-950 text-white text-sm font-semibold
                 hover:bg-green-800 transition-colors hover:cursor-pointer">
          Done
        </button>
      </div>
    </div>

    <template v-else>
      <!-- ── Body ─────────────────────────────────────────────────────────── -->
      <div class="overflow-y-auto flex-1 px-7 py-5 space-y-4">

        <!-- Tabs -->
        <div class="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          <button v-for="tab in [{ id: 'paste', label: 'Paste text' }, { id: 'excel', label: 'Upload Excel / CSV' }]"
            :key="tab.id" @click="activeTab = tab.id" :class="[
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:cursor-pointer',
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            ]">
            {{ tab.label }}
          </button>
        </div>

        <!-- ── Paste panel ────────────────────────────────────────────────── -->
        <div v-if="activeTab === 'paste'" class="space-y-2">
          <textarea v-model="rawInput" rows="7" placeholder="Paste your task data here (tab-separated columns):

Category / Parent Task Name (no dates = treated as header)
Task Name	TOOU	01/01/2026	28/02/2026	Green
Sub-task Name	PDU	01/02/2026	15/02/2026	Blue" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-mono resize-y
                   focus:outline-none focus:border-green-800 transition-colors text-gray-700
                   placeholder:text-gray-400 leading-relaxed" />
          <p class="text-xs text-gray-500">
            Columns (tab-separated):
            <strong class="text-gray-500">Task Name</strong> ·
            Assignee unit code (e.g. <code class="bg-gray-100 px-1 rounded">TOOU</code>) ·
            Start Date · End Date · Color
          </p>
          <button @click="parseText" class="w-full h-10 rounded-xl bg-green-950 text-white text-sm font-semibold
                   hover:bg-green-800 transition-colors hover:cursor-pointer">
            Parse &amp; Preview
          </button>
        </div>

        <!-- ── Excel / CSV panel ─────────────────────────────────────────── -->
        <div v-if="activeTab === 'excel'" class="space-y-3">
          <div class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
            :class="isDragging ? 'border-green-800 bg-green-50' : 'border-gray-300 hover:border-gray-400'"
            @click="$refs.fileInput.click()" @dragover.prevent="isDragging = true" @dragleave="isDragging = false"
            @drop="handleDrop">
            <svg class="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p class="text-sm font-medium text-gray-500">Drop your file here or click to browse</p>
            <p class="text-xs text-gray-400 mt-1">Supports .xlsx · .xls · .csv</p>
          </div>
          <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleFileInput" />
          <p v-if="fileStatus" class="text-xs text-gray-500 text-center animate-pulse">{{ fileStatus }}</p>

          <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p class="text-xs text-amber-700 leading-relaxed">
              <strong>Expected columns:</strong> Task Name · Assignee unit code · Start Date · End Date · Color.
              Rows without dates become parent tasks; rows below them become sub-tasks.
              A header row will be skipped automatically if detected.
            </p>
          </div>
        </div>

        <!-- ── Preview ───────────────────────────────────────────────────── -->
        <template v-if="parsedTasks.length">
          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-gray-800">Preview</span>
              <span class="text-xs font-semibold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">
                {{ parsedTasks.length }} task{{ parsedTasks.length !== 1 ? 's' : '' }}
              </span>
            </div>
            <button @click="clearAll" class="text-xs text-gray-400 hover:text-gray-600 underline">Clear all</button>
          </div>

          <div class="space-y-2">
            <div v-for="(task, ti) in parsedTasks" :key="ti" class="border border-gray-200 rounded-xl overflow-hidden">

              <!-- Card header row -->
              <div
                class="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                @click="toggleExpand(ti)">
                <div class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: dotColor(task.color) }"></div>
                <span class="flex-1 text-sm font-medium text-gray-800 truncate min-w-0">
                  {{ task.name || '(Untitled)' }}
                </span>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <span v-if="!task.resolvedAssigneeId"
                    class="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">No assignee</span>
                  <span v-if="!task.end" class="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">No
                    deadline</span>
                  <span class="text-xs text-gray-400">
                    {{ task.assignee || '—' }}<template v-if="task.end"> · {{ task.end }}</template>
                  </span>
                  <span v-if="task.subTasks?.length" class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {{ task.subTasks.length }} sub
                  </span>
                  <svg class="w-4 h-4 text-gray-400 transition-transform flex-shrink-0"
                    :class="expanded[ti] ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <!-- Expanded edit fields -->
              <div v-if="expanded[ti]" class="border-t border-gray-100 px-4 py-4 space-y-3 bg-gray-50/60">

                <!-- Title + Assignee -->
                <div class="flex gap-3">
                  <div class="flex-1 space-y-1">
                    <label class="text-xs font-semibold text-gray-600">
                      Title <span class="text-red-500">*</span>
                    </label>
                    <input v-model="task.name" type="text" maxlength="100" placeholder="Task title…" class="w-full border border-gray-300 rounded-lg h-9 px-3 text-sm bg-white
                             focus:outline-none focus:border-green-800 transition-colors hover:cursor-pointer" />
                  </div>
                  <div class="w-48 space-y-1">
                    <label class="text-xs font-semibold text-gray-600">
                      Assignee <span class="text-red-500">*</span>
                    </label>
                    <select v-model="task.resolvedAssigneeId" class="w-full border border-gray-300 rounded-lg h-9 px-2 text-sm bg-white
                             focus:outline-none focus:border-green-800 transition-colors hover:cursor-pointer">
                      <option :value="null" disabled hidden>Select…</option>
                      <option v-for="m in assignableMembers" :key="m.id" :value="m.id">
                        {{ memberLabel(m) }}
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Description -->
                <div class="space-y-1">
                  <label class="text-xs font-semibold text-gray-600">Description</label>
                  <textarea v-model="task.description" rows="2" maxlength="500" placeholder="Describe the task…" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none bg-white
                           focus:outline-none focus:border-green-800 transition-colors" />
                </div>

                <!-- Type + Dates -->
                <div class="flex gap-3">
                  <div class="space-y-1">
                    <label class="text-xs font-semibold text-gray-600">Type</label>
                    <select v-model="task.type" class="border border-gray-300 rounded-lg h-9 px-2 text-sm bg-white
                             focus:outline-none focus:border-green-800 hover:cursor-pointer">
                      <option v-for="t in typeOptions" :key="t.id" :value="t.id">{{ t.label }}</option>
                    </select>
                  </div>
                  <div class="flex-1 space-y-1">
                    <label class="text-xs font-semibold text-gray-600">Start date</label>
                    <input v-model="task.start" type="date" class="w-full border border-gray-300 rounded-lg h-9 px-3 text-sm bg-white
                             focus:outline-none focus:border-green-800 hover:cursor-pointer" />
                  </div>
                  <div class="flex-1 space-y-1">
                    <label class="text-xs font-semibold text-gray-600">
                      Deadline <span class="text-red-500">*</span>
                    </label>
                    <input v-model="task.end" type="date" class="w-full border border-gray-300 rounded-lg h-9 px-3 text-sm bg-white
                             focus:outline-none focus:border-green-800 hover:cursor-pointer" />
                  </div>
                </div>

                <!-- Urgent -->
                <div class="flex items-center gap-2">
                  <input v-model="task.urgent" type="checkbox" :id="`urg-${ti}`"
                    class="w-4 h-4 accent-red-700 hover:cursor-pointer" />
                  <label :for="`urg-${ti}`" class="text-xs font-semibold text-red-700">Mark as Urgent</label>
                </div>

                <!-- Sub-tasks -->
                <div class="space-y-2 pt-1">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-semibold text-gray-600">Sub-tasks</label>
                    <button type="button" @click="addSubTask(ti)"
                      class="text-xs text-green-800 font-semibold hover:text-green-600 transition-colors hover:cursor-pointer">
                      + Add sub-task
                    </button>
                  </div>
                  <div v-if="task.subTasks?.length" class="space-y-1.5">
                    <div v-for="(sub, si) in task.subTasks" :key="si" class="flex items-center gap-2">
                      <span class="text-xs text-gray-400 w-4 text-right flex-shrink-0">{{ si + 1 }}</span>
                      <input v-model="sub.name" type="text" maxlength="200" :placeholder="`Sub-task ${si + 1}…`" class="flex-1 border border-gray-200 rounded-lg h-8 px-3 text-xs bg-white
                               focus:outline-none focus:border-green-800" />
                      <button type="button" @click="removeSubTask(ti, si)"
                        class="text-gray-300 hover:text-red-400 text-lg leading-none transition-colors hover:cursor-pointer">×</button>
                    </div>
                  </div>
                  <p v-else class="text-xs text-gray-400 italic">No sub-tasks — click "+ Add sub-task" above</p>
                </div>

                <!-- Remove task -->
                <div class="pt-2 border-t border-gray-200 flex justify-end">
                  <button type="button" @click="removeTask(ti)"
                    class="text-xs text-red-400 hover:text-red-600 font-medium transition-colors hover:cursor-pointer">
                    Remove this task
                  </button>
                </div>

              </div>
            </div>
          </div>
        </template>

        <!-- Empty state (paste tab, nothing typed yet) -->
        <div v-else-if="activeTab === 'paste' && !rawInput" class="text-center py-10 text-gray-400 text-sm select-none">
          Paste your data above and click <strong class="font-medium">Parse &amp; Preview</strong>
        </div>

        <!-- Error banner -->
        <div v-if="errorMsg" class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd" />
          </svg>
          <p class="text-xs text-red-700">{{ errorMsg }}</p>
        </div>

      </div>

      <!-- ── Footer ─────────────────────────────────────────────────────────── -->
      <div class="flex gap-3 px-7 py-4 border-t border-gray-100">
        <button @click.self="emit('close')" class="flex-1 h-11 rounded-xl border-2 border-gray-300 text-gray-600 font-semibold text-sm
                 hover:border-green-800 hover:text-green-800 transition-colors hover:cursor-pointer">
          Cancel
        </button>
        <button @click="submitAll" :disabled="submitting || !parsedTasks.length" class="flex-1 h-11 rounded-xl bg-green-950 text-white font-semibold text-sm
                 hover:bg-green-800 active:scale-95 transition-all
                 disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer
                 flex items-center justify-center gap-2">
          <svg v-if="submitting" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" stroke-width="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="white" stroke-width="3" stroke-linecap="round" />
          </svg>
          <span v-if="submitting">
            Submitting… ({{ successCount }}/{{ parsedTasks.length }})
          </span>
          <span v-else>
            Submit {{ parsedTasks.length ? parsedTasks.length : '' }}
            task{{ parsedTasks.length !== 1 ? 's' : '' }}
          </span>
        </button>
      </div>
    </template>

  </div>
</template>