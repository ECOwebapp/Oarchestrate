<script setup>
import TaskDetail from '@/components/TaskDetail.vue'
import { supabase } from '@/lib/supabaseClient'
import { taskStore } from '@/stores/tasks'
import { useAuthStore } from '@/stores/useAuthStore'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const auth  = useAuthStore()
const store = taskStore()

// ── Month navigation ──
const selectedMonth  = ref(new Date().getMonth())
const selectedYear   = ref(new Date().getFullYear())
const MONTHS_FULL    = ['January','February','March','April','May','June',
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
  if (isCurrentMonth.value) return
  if (selectedMonth.value === 11) { selectedMonth.value = 0; selectedYear.value++ }
  else selectedMonth.value++
}

// ── Selected task (modal) ──
const selectedTask = ref(null)
const openTask  = (t) => { selectedTask.value = t }
const closeTask = () =>  { selectedTask.value = null }
const onRefresh = async () => {
  await store.fetchTasks()
  if (selectedTask.value)
    selectedTask.value = store.tasks.find(t => t.id === selectedTask.value.id) || null
}

onMounted(() => store.fetchTasks())

// Realtime
let channel = null
onMounted(() => {
  channel = supabase
    .channel('dashboard-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'task_approval' }, onRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'task_output' },   onRefresh)
    .subscribe()
})
onUnmounted(() => channel?.unsubscribe())

// ── Helpers ──
const fmt       = (d) => d ? new Date(d).toLocaleDateString('en-PH', { year:'numeric', month:'short', day:'numeric' }) : '—'
const isOverdue = (d) => d && new Date(d) < new Date()

// ── Donut ──
const R    = 42
const CX   = 56
const CY   = 56
const CIRC = 2 * Math.PI * R

// ── Filtered tasks for current month ──
const forMonth = (list) => list.filter(t => {
  if (!t.from) return false
  const d = new Date(t.from)
  return d.getMonth() === selectedMonth.value && d.getFullYear() === selectedYear.value
})

// ─────────────────────────────────────────────
// DIRECTOR
// ─────────────────────────────────────────────
const directorPending     = computed(() => store.tasks.filter(t => t.unitHead && !t.director))
const directorMonth       = computed(() => forMonth(directorPending.value))
const directorRegular     = computed(() => directorMonth.value.filter(t => t.type?.toLowerCase() !== 'insertion').sort((a,b) => (b.urgent?1:0)-(a.urgent?1:0)))
const directorInsertion   = computed(() => directorMonth.value.filter(t => t.type?.toLowerCase() === 'insertion').sort((a,b) => (b.urgent?1:0)-(a.urgent?1:0)))

const directorDonut = computed(() => {
  const regular   = directorMonth.value.filter(t => t.type?.toLowerCase() !== 'insertion' && !t.urgent).length
  const urgent    = directorMonth.value.filter(t => t.urgent).length
  const insertion = directorMonth.value.filter(t => t.type?.toLowerCase() === 'insertion').length
  const total     = regular + urgent + insertion || 1
  let offset = 0
  return [
    { value: regular,   color: '#15803d', label: 'Regular'   },
    { value: urgent,    color: '#b91c1c', label: 'Urgent'    },
    { value: insertion, color: '#b45309', label: 'Insertion' },
  ].map(s => { const len = CIRC*(s.value/total); const seg = {...s,len,offset:-offset}; offset+=len; return seg })
})

// ─────────────────────────────────────────────
// UNIT HEAD
// ─────────────────────────────────────────────
const uhPending    = computed(() => store.tasks.filter(t =>
  t.assignee !== auth.userID &&
  !t.unitHead &&
  !t.director &&
  t.outputLink &&
  t.assigneeRole === 3 // only unit member submissions
))
const uhOwn        = computed(() => store.tasks.filter(t => t.assignee === auth.userID))
const uhMonth      = computed(() => forMonth(uhPending.value))
const uhRegular    = computed(() => uhMonth.value.filter(t => t.type?.toLowerCase() !== 'insertion').sort((a,b)=>(b.urgent?1:0)-(a.urgent?1:0)))
const uhInsertion  = computed(() => uhMonth.value.filter(t => t.type?.toLowerCase() === 'insertion').sort((a,b)=>(b.urgent?1:0)-(a.urgent?1:0)))

const uhDonut = computed(() => {
  const regular   = uhMonth.value.filter(t => t.type?.toLowerCase() !== 'insertion' && !t.urgent).length
  const urgent    = uhMonth.value.filter(t => t.urgent).length
  const insertion = uhMonth.value.filter(t => t.type?.toLowerCase() === 'insertion').length
  const total     = regular + urgent + insertion || 1
  let offset = 0
  return [
    { value: regular,   color: '#15803d', label: 'Regular'   },
    { value: urgent,    color: '#b91c1c', label: 'Urgent'    },
    { value: insertion, color: '#b45309', label: 'Insertion' },
  ].map(s => { const len = CIRC*(s.value/total); const seg = {...s,len,offset:-offset}; offset+=len; return seg })
})

// ─────────────────────────────────────────────
// MEMBER
// ─────────────────────────────────────────────
const memberRegular   = computed(() => store.tasks.filter(t => t.type?.toLowerCase() !== 'insertion').sort((a,b)=>(b.urgent?1:0)-(a.urgent?1:0)))
const memberInsertion = computed(() => store.tasks.filter(t => t.type?.toLowerCase() === 'insertion').sort((a,b)=>(b.urgent?1:0)-(a.urgent?1:0)))
const memberRevisions = computed(() => store.tasks.filter(t => t.revision && !t.director))

const memberDonut = computed(() => {
  const approved  = store.tasks.filter(t => t.director).length
  const submitted = store.tasks.filter(t => t.outputLink && !t.director).length
  const pending   = store.tasks.filter(t => !t.outputLink && !t.director).length
  const total     = approved + submitted + pending || 1
  let offset = 0
  return [
    { value: approved,  color: '#15803d', label: 'Approved'  },
    { value: submitted, color: '#b45309', label: 'Submitted' },
    { value: pending,   color: '#9ca3af', label: 'Pending'   },
  ].map(s => { const len = CIRC*(s.value/total); const seg = {...s,len,offset:-offset}; offset+=len; return seg })
})

// ─────────────────────────────────────────────
// Computed shorthands for template
// ─────────────────────────────────────────────
const activeDonut    = computed(() => auth.isDirector ? directorDonut.value    : auth.isUnitHead ? uhDonut.value    : memberDonut.value)
const activePending  = computed(() => auth.isDirector ? directorMonth.value    : auth.isUnitHead ? uhMonth.value    : store.tasks)
const activeRegular  = computed(() => auth.isDirector ? directorRegular.value  : auth.isUnitHead ? uhRegular.value  : memberRegular.value)
const activeInsertion= computed(() => auth.isDirector ? directorInsertion.value: auth.isUnitHead ? uhInsertion.value: memberInsertion.value)
</script>

<template>
  <div class="director-dash flex flex-col w-full h-full overflow-hidden bg-gray-50">

    <!-- ══ LOADING ══ -->
    <div v-if="store.loading && !store.tasks.length"
      class="flex-1 flex items-center justify-center gap-3">
      <svg class="animate-spin w-5 h-5 text-green-700" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#d1fae5" stroke-width="3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
      </svg>
      <span class="text-sm text-gray-500 tracking-wide">Loading…</span>
    </div>

    <!-- ══ CONTENT ══ -->
    <div v-else class="flex flex-col flex-1 min-h-0">

      <!-- Top bar -->
      <div class="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100 flex-shrink-0 fade-in">
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-widest">
            {{ auth.isDirector ? 'Director' : auth.isUnitHead ? 'Unit Head' : 'Member' }}
            <span v-if="auth.isUnitHead && auth.unitName" class="ml-2 font-normal text-green-700">
              ({{ auth.unitName }}, #{{ auth.unitId }})
            </span>
          </p>
          <p class="text-base font-bold text-gray-800">
            {{ auth.isDirector ? 'Tasks Awaiting Your Approval'
              : auth.isUnitHead ? 'Unit Dashboard'
              : 'My Tasks' }}
          </p>
        </div>

        <!-- Month navigator (director + unit head) -->
        <div v-if="auth.isDirector || auth.isUnitHead"
          class="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1">
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

        <!-- Member: revision alert -->
        <div v-else-if="memberRevisions.length"
          class="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5">
          <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"/>
          <span class="text-xs font-bold text-orange-700">
            {{ memberRevisions.length }} revision{{ memberRevisions.length > 1 ? 's' : '' }} needed
          </span>
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
                    v-for="(seg, i) in activeDonut" :key="i"
                    :cx="CX" :cy="CY" :r="R"
                    fill="none" :stroke="seg.color" stroke-width="12" stroke-linecap="butt"
                    :stroke-dasharray="`${seg.len} ${CIRC - seg.len}`"
                    :stroke-dashoffset="seg.offset"
                    class="donut-seg" :style="`animation-delay:${i*100}ms`"
                  />
                </g>
                <text :x="CX" :y="CY - 5" text-anchor="middle" font-size="24" font-weight="800" fill="#111827">
                  {{ activePending.length }}
                </text>
                <text :x="CX" :y="CY + 11" text-anchor="middle" font-size="9" fill="#9ca3af">
                  {{ auth.isMember ? 'tasks' : 'pending' }}
                </text>
              </svg>
              <div class="flex flex-col gap-1.5 w-full mt-3 px-1">
                <div v-for="seg in activeDonut" :key="seg.label" class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full" :style="`background:${seg.color}`"/>
                    <span class="text-gray-500">{{ seg.label }}</span>
                  </div>
                  <span class="font-bold text-gray-800">{{ seg.value }}</span>
                </div>
              </div>
            </div>

            <!-- Stat card 1 -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between slide-up" style="animation-delay:60ms">
              <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" class="w-5 h-5 fill-green-700">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <p class="text-4xl font-black text-gray-900 tabular-nums">{{ activeRegular.length }}</p>
                <p class="text-xs text-gray-400 uppercase tracking-widest mt-1">Regular Tasks</p>
              </div>
              <p class="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                {{ activeRegular.filter(t=>t.urgent).length }} urgent priority
              </p>
            </div>

            <!-- Stat card 2 -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between slide-up" style="animation-delay:120ms">
              <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" class="w-5 h-5 fill-amber-700">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <p class="text-4xl font-black text-gray-900 tabular-nums">{{ activeInsertion.length }}</p>
                <p class="text-xs text-gray-400 uppercase tracking-widest mt-1">Insertion Tasks</p>
              </div>
              <p class="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
                {{ activeInsertion.filter(t=>t.urgent).length }} urgent priority
              </p>
            </div>

            <!-- Stat card 3 -->
            <div class="bg-white rounded-2xl border shadow-sm p-5 flex flex-col justify-between slide-up"
              :class="auth.isMember ? 'border-orange-100' : 'border-red-100'"
              style="animation-delay:180ms">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                :class="auth.isMember ? 'bg-orange-100' : 'bg-red-100'">
                <svg v-if="!auth.isMember" viewBox="0 0 24 24" class="w-5 h-5 fill-red-700">
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" class="w-5 h-5 fill-orange-700">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </div>
              <div>
                <p class="text-4xl font-black tabular-nums"
                  :class="auth.isMember ? 'text-orange-700' : 'text-red-700'">
                  {{ auth.isMember ? memberRevisions.length : activePending.filter(t=>t.urgent).length }}
                </p>
                <p class="text-xs text-gray-400 uppercase tracking-widest mt-1">
                  {{ auth.isMember ? 'Revisions Needed' : 'Urgent Tasks' }}
                </p>
              </div>
              <p class="text-xs mt-3 flex items-center gap-1.5"
                :class="auth.isMember ? 'text-orange-400' : 'text-red-400'">
                <span class="w-2 h-2 rounded-full animate-pulse"
                  :class="auth.isMember ? 'bg-orange-500' : 'bg-red-500'"/>
                {{ auth.isMember ? 'Action required' : 'Needs priority review' }}
              </p>
            </div>
          </div>

          <!-- ── Regular Tasks ── -->
          <section class="slide-up" style="animation-delay:220ms">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-xs font-extrabold uppercase tracking-[0.15em] text-gray-500">
                {{ auth.isUnitHead ? 'Regular — Awaiting Review' : 'Regular Tasks' }}
              </h2>
              <span class="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2.5 py-0.5">
                {{ activeRegular.length }} pending
              </span>
            </div>

            <div v-if="activeRegular.length === 0"
              class="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <p class="text-sm text-gray-400">
                No regular tasks pending{{ auth.isDirector || auth.isUnitHead ? ` for ${MONTHS_FULL[selectedMonth]}` : '' }}.
              </p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div
                v-for="(task, i) in activeRegular" :key="task.id"
                class="task-card bg-white rounded-2xl border shadow-sm cursor-pointer group overflow-hidden"
                :class="task.urgent ? 'border-red-200' : 'border-gray-100'"
                :style="`animation-delay:${240 + i*35}ms`"
                @click="openTask(task)">

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
                    {{ task.name }}
                  </p>
                  <p class="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{{ task.description }}</p>

                  <div class="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                    <span class="truncate max-w-[60%]">{{ task.assigneeName }}</span>
                    <span>{{ fmt(task.from) }}</span>
                  </div>

                  <p v-if="isOverdue(task.to)"
                    class="mt-2 flex items-center gap-1 text-xs text-red-500 font-medium">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
                    Overdue · due {{ fmt(task.to) }}
                  </p>
                  <p v-else-if="task.to" class="mt-2 text-xs text-gray-400">Due {{ fmt(task.to) }}</p>

                  <p v-if="task.revision"
                    class="mt-1.5 flex items-center gap-1 text-xs text-orange-600 font-bold">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"/>
                    Revision requested
                  </p>

                  <!-- Hover actions (director + unit head) -->
                  <div v-if="!auth.isMember"
                    class="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                    <button @click.stop="openTask(task)"
                      class="flex-1 py-1.5 text-xs font-bold rounded-lg border-2 border-amber-400 text-amber-600
                             hover:bg-amber-50 transition-colors">
                      Review
                    </button>
                    <button @click.stop="openTask(task)"
                      class="flex-1 py-1.5 text-xs font-bold rounded-lg bg-green-800 text-white
                             hover:bg-green-700 transition-colors">
                      Approve
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
                {{ auth.isUnitHead ? 'Insertion — Awaiting Review' : 'Insertion Tasks' }}
              </h2>
              <span class="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2.5 py-0.5">
                {{ activeInsertion.length }} pending
              </span>
            </div>

            <div v-if="activeInsertion.length === 0"
              class="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <p class="text-sm text-gray-400">
                No insertion tasks pending{{ auth.isDirector || auth.isUnitHead ? ` for ${MONTHS_FULL[selectedMonth]}` : '' }}.
              </p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div
                v-for="(task, i) in activeInsertion" :key="task.id"
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
                    {{ task.name }}
                  </p>
                  <p class="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{{ task.description }}</p>

                  <div class="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                    <span class="truncate max-w-[60%]">{{ task.assigneeName }}</span>
                    <span>{{ fmt(task.from) }}</span>
                  </div>

                  <p v-if="isOverdue(task.to)"
                    class="mt-2 flex items-center gap-1 text-xs text-red-500 font-medium">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"/>
                    Overdue · due {{ fmt(task.to) }}
                  </p>
                  <p v-else-if="task.to" class="mt-2 text-xs text-gray-400">Due {{ fmt(task.to) }}</p>

                  <p v-if="task.revision"
                    class="mt-1.5 flex items-center gap-1 text-xs text-orange-600 font-bold">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"/>
                    Revision requested
                  </p>

                  <div v-if="!auth.isMember"
                    class="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                    <button @click.stop="openTask(task)"
                      class="flex-1 py-1.5 text-xs font-bold rounded-lg border-2 border-amber-400 text-amber-600
                             hover:bg-amber-50 transition-colors">
                      Review
                    </button>
                    <button @click.stop="openTask(task)"
                      class="flex-1 py-1.5 text-xs font-bold rounded-lg bg-green-800 text-white
                             hover:bg-green-700 transition-colors">
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Unit Head: Own Tasks ── -->
          <section v-if="auth.isUnitHead && uhOwn.length" class="slide-up pb-4" style="animation-delay:300ms">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-xs font-extrabold uppercase tracking-[0.15em] text-gray-500">Your Own Tasks</h2>
              <span class="text-xs text-gray-400 bg-white border border-gray-200 rounded-full px-2.5 py-0.5">
                {{ uhOwn.length }}
              </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div v-for="(task, i) in uhOwn.sort((a,b)=>(b.urgent?1:0)-(a.urgent?1:0))" :key="task.id"
                class="task-card bg-white rounded-2xl border shadow-sm cursor-pointer group overflow-hidden"
                :class="task.urgent ? 'border-red-200' : 'border-gray-100'"
                :style="`animation-delay:${300+i*35}ms`"
                @click="openTask(task)">
                <div class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
                  :class="task.urgent ? 'bg-red-600 text-white' : task.type?.toLowerCase()==='insertion' ? 'bg-amber-600 text-white' : 'bg-green-800 text-white'">
                  {{ task.urgent ? 'URGENT' : task.type?.toUpperCase() || 'REGULAR' }}
                </div>
                <div class="p-4">
                  <p class="font-bold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-green-800 transition-colors">{{ task.name }}</p>
                  <p class="text-xs text-gray-400 line-clamp-2 mb-4">{{ task.description }}</p>
                  <div class="flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-3">
                    <span class="font-semibold" :class="task.director ? 'text-green-600' : task.unitHead ? 'text-amber-600' : 'text-gray-400'">
                      {{ task.director ? '✓ Approved' : task.unitHead ? 'At Director' : 'Pending' }}
                    </span>
                    <span>{{ fmt(task.to) }}</span>
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
      <TaskDetail
        v-if="selectedTask"
        :task="selectedTask"
        @close="closeTask"
        @refresh="onRefresh"
      />
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>