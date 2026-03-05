<script setup vapor>
import Icons from '@/components/Icons.vue'
import Loading from '@/components/Loading.vue'
import Error from '@/components/Error.vue'
import { taskStore } from '@/stores/tasks'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed, onMounted, ref } from 'vue'

const auth = useAuthStore()
const error = taskStore().error
const loading = taskStore().loading

// Position IDs that go DIRECTLY to director (no unit head step needed)
// Director, Assistant Director, Office Chief, Documentation Officer, Technical Admin/Clerical
const DIRECT_TO_DIRECTOR_POSITIONS = [1, 2, 3, 9, 10]

// ── State ──
const tasks = taskStore().tasks
const selectedTask  = ref(null)
const approvingId   = ref(null)
const revisingId    = ref(null)

// ── Month navigation ──
const selectedMonth = ref(new Date().getMonth())
const selectedYear  = ref(new Date().getFullYear())

const MONTHS_FULL = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December']

const isCurrentMonth = computed(() =>
  selectedMonth.value === new Date().getMonth() &&
  selectedYear.value  === new Date().getFullYear()
)
const prevMonth = () => {
  if (selectedMonth.value === 0) { selectedMonth.value = 11; selectedYear.value-- }
  else selectedMonth.value--
}
const nextMonth = () => {
  if (selectedMonth.value === 11) { selectedMonth.value = 0; selectedYear.value++ }
  else selectedMonth.value++
}

// ── Helpers ──
const fmt = (d) => d
  ? new Date(d).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' })
  : '—'

// ── Filtered by selected month ──
const tasksForMonth = computed(() =>
  tasks.filter(t => {
    if (!t.created) return false
    const d = new Date(t.created)
    return d.getMonth() === selectedMonth.value && d.getFullYear() === selectedYear.value
  })
)

const regularTasks = computed(() =>
  tasksForMonth.value
    .filter(t => t.type !== 'insertion')
    .sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0))
)
const insertionTasks = computed(() =>
  tasksForMonth.value
    .filter(t => t.type === 'insertion')
    .sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0))
)

// ── Donut chart ──
const R    = 42
const CX   = 56
const CY   = 56
const CIRC = 2 * Math.PI * R

const chartData = computed(() => ({
  regular:   tasksForMonth.value.filter(t => t.type !== 'insertion' && !t.urgent).length,
  urgent:    tasksForMonth.value.filter(t => t.urgent).length,
  insertion: tasksForMonth.value.filter(t => t.type === 'insertion').length,
}))

const donutSegments = computed(() => {
  const { regular, urgent, insertion } = chartData.value
  const total = regular + urgent + insertion || 1
  const defs  = [
    { value: regular,   color: '#15803d', label: 'Regular'   },
    { value: urgent,    color: '#b91c1c', label: 'Urgent'    },
    { value: insertion, color: '#b45309', label: 'Insertion' },
  ]
  let offset = 0
  return defs.map(s => {
    const len = CIRC * (s.value / total)
    const seg = { ...s, len, offset: -offset }
    offset += len
    return seg
  })
})

// ── Actions ──
const approveTask = async (task) => {
  approvingId.value = task.id
  try {
    const { error: e } = await supabase
      .from('task_approval').update({ director: true }).eq('id', task.id)
    if (e) throw e
    tasks = tasks.filter(t => t.id !== task.id)
    if (selectedTask.value?.id === task.id) selectedTask.value = null
  } catch(e) { console.error(e) }
  finally    { approvingId.value = null }
}

const reviseTask = async (task) => {
  revisingId.value = task.id
  try {
    const { error: e } = await supabase
      .from('task_approval').update({ unit_head: false }).eq('id', task.id)
    if (e) throw e
    tasks = tasks.filter(t => t.id !== task.id)
    if (selectedTask.value?.id === task.id) selectedTask.value = null
  } catch(e) { console.error(e) }
  finally    { revisingId.value = null }
}

const openTask  = (t) => { selectedTask.value = t }
const closeTask = () =>  { selectedTask.value = null }

const isOverdue = (d) => d && new Date(d) < new Date()
</script>

<template>
  <div class="director-dash flex flex-col w-full h-full overflow-hidden">

    <!-- ══ LOADING ══ -->
    <Loading v-if="loading" />

    <!-- ══ ERROR ══ -->
    <Error v-else-if="error" :error="error" />

    <!-- ══ CONTENT ══ -->
    <div v-else class="flex flex-col flex-1 min-h-0">

      <!-- Top bar -->
      <div class="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 flex-shrink-0 fade-in">
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-widest">Director</p>
          <p class="text-base font-bold text-gray-800">Tasks Awaiting Your Approval</p>
        </div>

        <!-- Month navigator -->
        <div class="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
          <button @click="prevMonth"
            class="w-7 h-7 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 text-lg leading-none flex items-center justify-center">
            ‹
          </button>
          <span class="text-sm font-semibold text-gray-700 w-36 text-center select-none">
            {{ MONTHS_FULL[selectedMonth] }} {{ selectedYear }}
          </span>
          <button @click="nextMonth" :disabled="isCurrentMonth"
            class="w-7 h-7 rounded-lg hover:bg-gray-200 transition-colors text-gray-500 text-lg leading-none flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed">
            ›
          </button>
        </div>
      </div>

      <!-- Scrollable body -->
      <div class="flex-1 min-h-0 overflow-y-auto">
        <div class="p-4 md:p-6 flex flex-col gap-6">

          <!-- ── Summary row ── -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <!-- Donut -->
            <div class="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center slide-up" style="animation-delay:0ms">
              <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 self-start">Monthly Overview</p>
              <svg :width="CX*2" :height="CY*2" :viewBox="`0 0 ${CX*2} ${CY*2}`" class="overflow-visible">
                <circle :cx="CX" :cy="CY" :r="R" fill="none" stroke="#f3f4f6" stroke-width="12"/>
                <g :transform="`rotate(-90 ${CX} ${CY})`">
                  <circle
                    v-for="(seg, i) in donutSegments" :key="i"
                    :cx="CX" :cy="CY" :r="R"
                    fill="none" :stroke="seg.color" stroke-width="12" stroke-linecap="butt"
                    :stroke-dasharray="`${seg.len} ${CIRC - seg.len}`"
                    :stroke-dashoffset="seg.offset"
                    class="donut-seg" :style="`animation-delay:${i*100}ms`"
                  />
                </g>
                <text :x="CX" :y="CY - 5" text-anchor="middle" font-size="24" font-weight="800" fill="#111827">
                  {{ tasksForMonth.length }}
                </text>
                <text :x="CX" :y="CY + 11" text-anchor="middle" font-size="9" fill="#9ca3af">pending</text>
              </svg>
              <div class="flex flex-col gap-1.5 w-full mt-3 px-1">
                <div v-for="seg in donutSegments" :key="seg.label" class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full" :style="`background:${seg.color}`"/>
                    <span class="text-gray-500">{{ seg.label }}</span>
                  </div>
                  <span class="font-bold text-gray-800">{{ seg.value }}</span>
                </div>
              </div>
            </div>

            <!-- Regular stat -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between slide-up" style="animation-delay:60ms">
              <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" class="w-5 h-5 fill-green-700">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <p class="text-4xl font-black text-gray-900 tabular-nums">{{ regularTasks.length }}</p>
                <p class="text-xs text-gray-400 uppercase tracking-widest mt-1">Regular Tasks</p>
              </div>
              <p class="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                {{ regularTasks.filter(t=>t.urgent).length }} urgent priority
              </p>
            </div>

            <!-- Insertion stat -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between slide-up" style="animation-delay:120ms">
              <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" class="w-5 h-5 fill-amber-700">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <p class="text-4xl font-black text-gray-900 tabular-nums">{{ insertionTasks.length }}</p>
                <p class="text-xs text-gray-400 uppercase tracking-widest mt-1">Insertion Tasks</p>
              </div>
              <p class="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                {{ insertionTasks.filter(t=>t.urgent).length }} urgent priority
              </p>
            </div>

            <!-- Urgent stat -->
            <div class="bg-white rounded-2xl border border-red-100 shadow-sm p-5 flex flex-col justify-between slide-up" style="animation-delay:180ms">
              <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" class="w-5 h-5 fill-red-700">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
              </div>
              <div>
                <p class="text-4xl font-black text-red-700 tabular-nums">{{ tasksForMonth.filter(t=>t.urgent).length }}</p>
                <p class="text-xs text-gray-400 uppercase tracking-widest mt-1">Urgent Tasks</p>
              </div>
              <p class="text-xs text-red-400 mt-3 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                Needs priority review
              </p>
            </div>
          </div>

          <!-- ── Regular Tasks ── -->
          <section class="slide-up" style="animation-delay:220ms">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-xs font-extrabold uppercase tracking-[0.15em] text-gray-500">
                Regular Tasks
              </h2>
              <span class="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2.5 py-0.5">
                {{ regularTasks.length }} pending
              </span>
            </div>

            <div v-if="regularTasks.length === 0"
              class="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <p class="text-sm text-gray-400">No regular tasks pending for {{ MONTHS_FULL[selectedMonth] }}.</p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div
                v-for="(task, i) in regularTasks" :key="task.id"
                class="task-card bg-white rounded-2xl border shadow-sm cursor-pointer group overflow-hidden"
                :class="task.urgent ? 'border-red-200' : 'border-gray-100'"
                :style="`animation-delay:${240 + i*35}ms`"
                @click="openTask(task)">

                <!-- Top ribbon -->
                <div class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                  :class="task.urgent ? 'bg-red-600 text-white' : 'bg-green-800 text-white'">
                  <svg v-if="task.urgent" viewBox="0 0 24 24" class="w-3 h-3 fill-current">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  </svg>
                  {{ task.urgent ? 'URGENT' : 'REGULAR' }}
                </div>

                <div class="p-4">
                  <p class="font-bold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2
                             group-hover:text-green-800 transition-colors duration-150">
                    {{ task.title }}
                  </p>
                  <p class="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{{ task.description }}</p>

                  <div class="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                    <span class="truncate max-w-[60%]">{{ task.assignedTo }}</span>
                    <span>{{ fmt(task.created) }}</span>
                  </div>

                  <p v-if="isOverdue(task.deadline)"
                    class="mt-2 flex items-center gap-1 text-xs text-red-500 font-medium">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
                    Overdue · due {{ fmt(task.deadline) }}
                  </p>
                  <p v-else-if="task.deadline" class="mt-2 text-xs text-gray-400">
                    Due {{ fmt(task.deadline) }}
                  </p>

                  <!-- Hover actions -->
                  <div class="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                    <button @click.stop="reviseTask(task)" :disabled="revisingId === task.id"
                      class="flex-1 py-1.5 text-xs font-bold rounded-lg border-2 border-amber-400 text-amber-600
                             hover:bg-amber-50 transition-colors disabled:opacity-40">
                      {{ revisingId === task.id ? '…' : 'Revise' }}
                    </button>
                    <button @click.stop="approveTask(task)" :disabled="approvingId === task.id"
                      class="flex-1 py-1.5 text-xs font-bold rounded-lg bg-green-800 text-white
                             hover:bg-green-700 transition-colors disabled:opacity-40">
                      {{ approvingId === task.id ? '…' : 'Approve' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Insertion Tasks ── -->
          <section class="slide-up pb-4" style="animation-delay:260ms">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-xs font-extrabold uppercase tracking-[0.15em] text-gray-500">
                Insertion Tasks
              </h2>
              <span class="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2.5 py-0.5">
                {{ insertionTasks.length }} pending
              </span>
            </div>

            <div v-if="insertionTasks.length === 0"
              class="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <p class="text-sm text-gray-400">No insertion tasks pending for {{ MONTHS_FULL[selectedMonth] }}.</p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div
                v-for="(task, i) in insertionTasks" :key="task.id"
                class="task-card bg-white rounded-2xl border shadow-sm cursor-pointer group overflow-hidden"
                :class="task.urgent ? 'border-red-200' : 'border-amber-100'"
                :style="`animation-delay:${280 + i*35}ms`"
                @click="openTask(task)">

                <div class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                  :class="task.urgent ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'">
                  <svg v-if="task.urgent" viewBox="0 0 24 24" class="w-3 h-3 fill-current">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  </svg>
                  {{ task.urgent ? 'URGENT INSERTION' : 'INSERTION' }}
                </div>

                <div class="p-4">
                  <p class="font-bold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2
                             group-hover:text-amber-700 transition-colors duration-150">
                    {{ task.title }}
                  </p>
                  <p class="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{{ task.description }}</p>

                  <div class="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                    <span class="truncate max-w-[60%]">{{ task.assignedTo }}</span>
                    <span>{{ fmt(task.created) }}</span>
                  </div>

                  <p v-if="isOverdue(task.deadline)"
                    class="mt-2 flex items-center gap-1 text-xs text-red-500 font-medium">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
                    Overdue · due {{ fmt(task.deadline) }}
                  </p>
                  <p v-else-if="task.deadline" class="mt-2 text-xs text-gray-400">
                    Due {{ fmt(task.deadline) }}
                  </p>

                  <div class="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                    <button @click.stop="reviseTask(task)" :disabled="revisingId === task.id"
                      class="flex-1 py-1.5 text-xs font-bold rounded-lg border-2 border-amber-400 text-amber-600
                             hover:bg-amber-50 transition-colors disabled:opacity-40">
                      {{ revisingId === task.id ? '…' : 'Revise' }}
                    </button>
                    <button @click.stop="approveTask(task)" :disabled="approvingId === task.id"
                      class="flex-1 py-1.5 text-xs font-bold rounded-lg bg-green-800 text-white
                             hover:bg-green-700 transition-colors disabled:opacity-40">
                      {{ approvingId === task.id ? '…' : 'Approve' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>

    <!-- ══ TASK DETAIL MODAL ══ -->
    <Transition name="modal">
      <div v-if="selectedTask"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="closeTask">

        <div class="modal-card bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">

          <!-- Header -->
          <div class="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
            <div class="flex-1 min-w-0 pr-4">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span v-if="selectedTask.urgent"
                  class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">URGENT</span>
                <span class="px-2.5 py-0.5 text-xs font-bold rounded-full capitalize"
                  :class="selectedTask.type === 'insertion' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'">
                  {{ selectedTask.type }}
                </span>
                <span v-if="selectedTask.unitHeadOk"
                  class="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                  ✓ Unit Head Approved
                </span>
              </div>
              <h2 class="text-xl font-bold text-gray-900 leading-snug">{{ selectedTask.title }}</h2>
            </div>
            <button @click="closeTask"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-xl flex-shrink-0">
              ×
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description</p>
              <p class="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
                {{ selectedTask.description || 'No description provided.' }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 rounded-xl p-3">
                <p class="text-xs text-gray-400 mb-1.5">Assigned by</p>
                <div class="flex items-center gap-2">
                  <Icons icon="account" class="w-4 h-4 text-gray-400 flex-shrink-0"/>
                  <span class="text-sm font-semibold text-gray-800 truncate">{{ selectedTask.assignedBy }}</span>
                </div>
              </div>
              <div class="bg-gray-50 rounded-xl p-3">
                <p class="text-xs text-gray-400 mb-1.5">Assigned to</p>
                <div class="flex items-center gap-2">
                  <Icons icon="account" class="w-4 h-4 text-gray-400 flex-shrink-0"/>
                  <span class="text-sm font-semibold text-gray-800 truncate">{{ selectedTask.assignedTo }}</span>
                </div>
              </div>
              <div class="bg-gray-50 rounded-xl p-3">
                <p class="text-xs text-gray-400 mb-1.5">Created</p>
                <span class="text-sm font-semibold text-gray-800">{{ fmt(selectedTask.created) }}</span>
              </div>
              <div class="rounded-xl p-3" :class="isOverdue(selectedTask.deadline) ? 'bg-red-50' : 'bg-gray-50'">
                <p class="text-xs text-gray-400 mb-1.5">Deadline</p>
                <span class="text-sm font-semibold" :class="isOverdue(selectedTask.deadline) ? 'text-red-600' : 'text-gray-800'">
                  {{ fmt(selectedTask.deadline) }}
                  <span v-if="isOverdue(selectedTask.deadline)" class="ml-1 text-xs">⚠ Overdue</span>
                </span>
              </div>
            </div>

            <div v-if="selectedTask.subtasks.length">
              <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Sub-tasks ({{ selectedTask.subtasks.length }})
              </p>
              <div class="space-y-2">
                <div v-for="(sub, i) in selectedTask.subtasks" :key="i"
                  class="flex items-start gap-3 bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
                  <span class="w-5 h-5 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {{ i+1 }}
                  </span>
                  {{ sub }}
                </div>
              </div>
            </div>

            <div v-if="selectedTask.outputLink">
              <p class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Output File</p>
              <a :href="selectedTask.outputLink" target="_blank"
                class="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3
                       text-sm text-blue-700 font-semibold hover:bg-blue-100 transition-colors">
                <Icons icon="file" class="w-4 h-4 flex-shrink-0"/>
                View Submitted File
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex gap-3 px-6 pb-6 pt-4 border-t border-gray-100 flex-shrink-0">
            <button @click="reviseTask(selectedTask)" :disabled="revisingId === selectedTask.id"
              class="flex-1 py-3 rounded-xl border-2 border-amber-400 text-amber-600 font-bold text-sm
                     hover:bg-amber-50 transition-colors disabled:opacity-40">
              {{ revisingId === selectedTask.id ? 'Sending back…' : '↩ Send for Revision' }}
            </button>
            <button @click="approveTask(selectedTask)" :disabled="approvingId === selectedTask.id"
              class="flex-1 py-3 rounded-xl bg-green-800 text-white font-bold text-sm
                     hover:bg-green-700 transition-colors disabled:opacity-40">
              {{ approvingId === selectedTask.id ? 'Approving…' : '✓ Approve' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
@keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
@keyframes slideUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
@keyframes donutIn { from { stroke-dashoffset:340; opacity:0 } to { opacity:1 } }

.fade-in  { animation: fadeIn  0.35s ease both }
.slide-up { animation: slideUp 0.45s cubic-bezier(.16,1,.3,1) both }

.task-card {
  animation: slideUp 0.45s cubic-bezier(.16,1,.3,1) both;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}
.task-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px -6px rgba(0,0,0,0.11);
}
.donut-seg { animation: donutIn 0.65s cubic-bezier(.16,1,.3,1) both }

.modal-enter-active { animation: fadeIn  0.25s ease both }
.modal-leave-active { animation: fadeIn  0.18s ease reverse }
.modal-card         { animation: slideUp 0.32s cubic-bezier(.16,1,.3,1) both }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>