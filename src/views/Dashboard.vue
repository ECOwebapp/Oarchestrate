<script setup vapor>
import Icons from '@/components/Icons.vue';
import { supabase } from '@/lib/supabaseClient';
import { computed, onMounted, ref } from 'vue';

const CURRENT_USER_ID = ref('a1000000-0000-0000-0000-000000000001')

const regularTasks   = ref([])
const urgentTasks    = ref([])
const insertionTasks = ref([])
const notifications  = ref([])
const loading        = ref(true)
const error          = ref(null)

const r = 45
const C = 2 * Math.PI * r

const getSegments = (approved, pendingApproval, pending) => {
  const total = approved + pendingApproval + pending
  if (total === 0) return []
  const approvedLen        = C * (approved / total)
  const pendingApprovalLen = C * (pendingApproval / total)
  const pendingLen         = C * (pending / total)
  return [
    { color: '#16a34a', length: approvedLen,         offset: 0 },
    { color: '#eab308', length: pendingApprovalLen,   offset: -approvedLen },
    { color: '#d1d5db', length: pendingLen,           offset: -(approvedLen + pendingApprovalLen) },
  ]
}

const deriveStatus = (unitHead, director) => {
  if (unitHead && director) return 'approved'
  if (!unitHead)            return 'pending_approval'
  return 'pending'
}

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return `${diff} seconds ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} days ago`
}

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

// Build UUID -> full name map via a separate user_profile query
const buildProfileMap = async (uuids) => {
  const unique = [...new Set(uuids.filter(Boolean))]
  if (!unique.length) return {}
  const { data, error: err } = await supabase
    .from('user_profile')
    .select('user_id, fname, lname')
    .in('user_id', unique)
  if (err) { console.error('profileMap error:', err); return {} }
  return Object.fromEntries(
    (data || []).map(p => [p.user_id, `${p.fname ?? ''} ${p.lname ?? ''}`.trim()])
  )
}

// Fetch tasks — no user_profile joins in main query to avoid FK hint issues
const fetchTasks = async (userId) => {
  loading.value = true
  error.value   = null
  try {
    const { data, error: err } = await supabase
      .from('task')
      .select(`
        id,
        parent_id,
        assigner,
        assignee,
        design,
        task_profile (
          title,
          description,
          urgent,
          revision,
          task_type_ref:task_type ( task_type )
        ),
        task_approval ( unit_head, director ),
        task_duration ( created, deadline ),
        task_output   ( link ),
        subtasks:task!parent_id (
          id,
          task_profile ( description )
        )
      `)
      .is('parent_id', null)
      .or(`assigner.eq.${userId},assignee.eq.${userId}`)
      .order('id')

    if (err) throw err

    const allUuids   = (data || []).flatMap(t => [t.assigner, t.assignee])
    const profileMap = await buildProfileMap(allUuids)

    const mapped = (data || []).map(row => ({
      id:           row.id,
      title:        (row.task_profile?.title || 'UNTITLED').toUpperCase().substring(0, 28) + '...',
      fullTitle:    row.task_profile?.title        || 'Untitled',
      description:  row.task_profile?.description  || '',
      submittedBy:  profileMap[row.assignee]       || 'Unknown',
      submittedOn:  formatDate(row.task_duration?.created),
      status:       deriveStatus(row.task_approval?.unit_head, row.task_approval?.director),
      highlight:    !row.task_approval?.unit_head,
      type:         row.task_profile?.task_type_ref?.task_type?.toLowerCase() || 'regular',
      progress:     (row.task_approval?.unit_head && row.task_approval?.director) ? 'completed' : 'ongoing',
      urgency:      row.task_profile?.urgent ? 'urgent' : 'regular',
      taskGiven:    formatDate(row.task_duration?.created),
      submitBefore: formatDate(row.task_duration?.deadline),
      assignedBy:   profileMap[row.assigner]       || 'Unknown',
      assignedTo:   profileMap[row.assignee]       || 'Unknown',
      subtasks:     (row.subtasks || []).map(s => s.task_profile?.description || ''),
      outputLink:   row.task_output?.link          || null,
    }))

    regularTasks.value   = mapped.filter(t => t.type === 'regular' && t.urgency === 'regular')
    urgentTasks.value    = mapped.filter(t => t.urgency === 'urgent')
    insertionTasks.value = mapped.filter(t => t.type === 'insertion')

  } catch (e) {
    error.value = e.message
    console.error('fetchTasks error:', e)
  } finally {
    loading.value = false
  }
}

// Fetch notifications — separate user_profile query for sender names
const fetchNotifications = async () => {
  try {
    const { data, error: err } = await supabase
      .from('comment_section')
      .select('id, comment, date_created, task_id, user_id')
      .order('date_created', { ascending: false })
      .limit(8)
    if (err) throw err

    const profileMap = await buildProfileMap((data || []).map(n => n.user_id))
    notifications.value = (data || []).map(n => ({
      from:    profileMap[n.user_id] || 'Unknown',
      message: n.comment,
      time:    timeAgo(n.date_created),
    }))
  } catch (e) {
    console.error('fetchNotifications error:', e)
  }
}

const countBy = (list, status) => list.value.filter(t => t.status === status).length

const taskSummaries = computed(() => [
  { label: 'REGULAR TASKS',   approved: countBy(regularTasks, 'approved'),   pendingApproval: countBy(regularTasks, 'pending_approval'),   pending: countBy(regularTasks, 'pending') },
  { label: 'URGENT TASKS',    approved: countBy(urgentTasks, 'approved'),    pendingApproval: countBy(urgentTasks, 'pending_approval'),    pending: countBy(urgentTasks, 'pending') },
  { label: 'INSERTION TASKS', approved: countBy(insertionTasks, 'approved'), pendingApproval: countBy(insertionTasks, 'pending_approval'), pending: countBy(insertionTasks, 'pending') },
])

const hoveredChart = ref(null)
const selectedTask = ref(null)

const openTask  = (task) => { selectedTask.value = { ...task }; if (task.status === 'approved') selectedTask.value.progress = 'completed' }
const closeTask = () => { selectedTask.value = null }

const approveTask = async () => {
  if (!selectedTask.value) return
  const { error: err } = await supabase
    .from('task_approval')
    .update({ unit_head: true, director: true })
    .eq('id', selectedTask.value.id)
  if (err) { console.error('approve error:', err); return }
  selectedTask.value.status   = 'approved'
  selectedTask.value.progress = 'completed'
  await fetchTasks(CURRENT_USER_ID.value)
}

const badgeClass = (value) => ({
  ongoing: 'bg-green-800 text-white', completed: 'bg-blue-600 text-white',
  urgent: 'bg-[#7b1c1c] text-white',  regular: 'bg-amber-500 text-white',
  insertion: 'bg-[#7b1c1c] text-white',
}[value] || 'bg-gray-300 text-gray-800')

const userOptions = [
  { label: 'Director',  id: 'a1000000-0000-0000-0000-000000000001' },
  { label: 'Unit Head', id: 'a1000000-0000-0000-0000-000000000002' },
  { label: 'Nheron',    id: 'a1000000-0000-0000-0000-000000000003' },
  { label: 'Ana',       id: 'a1000000-0000-0000-0000-000000000004' },
  { label: 'Carlo',     id: 'a1000000-0000-0000-0000-000000000005' },
]

const switchUser = async (id) => {
  CURRENT_USER_ID.value = id
  await Promise.all([fetchTasks(id), fetchNotifications()])
}

onMounted(() => switchUser(CURRENT_USER_ID.value))
</script>

<template>
  <div class="flex flex-col w-full h-full">

    <!-- Dev User Switcher -->
    <div class="flex items-center gap-2 bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-xs flex-shrink-0 flex-wrap">
      <span class="font-bold text-yellow-700">🧪 View as:</span>
      <button v-for="u in userOptions" :key="u.id" @click="switchUser(u.id)"
        :class="['px-3 py-1 rounded-full border font-semibold transition-colors',
          CURRENT_USER_ID === u.id ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-white text-yellow-700 border-yellow-400 hover:bg-yellow-100']">
        {{ u.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-400 text-sm gap-2">
      <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#d1d5db" stroke-width="3"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>
      </svg>
      Loading tasks…
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600 max-w-md">
        <strong>Error:</strong> {{ error }}
      </div>
    </div>

    <!-- Body -->
    <div v-else class="flex flex-1 min-h-0 overflow-hidden">

      <main class="flex-1 bg-gray-50 p-4 overflow-hidden flex flex-col gap-3">

        <!-- Donut Charts -->
        <div class="flex-shrink-0 bg-white rounded-xl shadow-sm p-3 flex justify-around">
          <div v-for="summary in taskSummaries" :key="summary.label"
            class="flex flex-col items-center cursor-pointer"
            @mouseenter="hoveredChart = summary.label" @mouseleave="hoveredChart = null">
            <div class="relative w-32 h-32 flex items-center justify-center">
              <span class="absolute top-1 right-0 text-xs text-right leading-tight transition-opacity duration-200"
                :class="hoveredChart === summary.label ? 'opacity-100' : 'opacity-0'">
                <span class="text-gray-600 font-semibold">{{ summary.pending }}</span><br/>
                <span class="text-gray-400">Pending</span>
              </span>
              <span class="absolute bottom-1 left-0 text-xs leading-tight transition-opacity duration-200"
                :class="hoveredChart === summary.label ? 'opacity-100' : 'opacity-0'">
                <span class="text-gray-600 font-semibold">{{ summary.approved }}</span><br/>
                <span class="text-gray-400">Approved</span>
              </span>
              <svg width="100" height="100" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" stroke-width="14"/>
                <g transform="rotate(-90 60 60)">
                  <circle v-for="(seg, i) in getSegments(summary.approved, summary.pendingApproval, summary.pending)"
                    :key="i" cx="60" cy="60" r="45" fill="none" :stroke="seg.color" stroke-width="14"
                    :stroke-dasharray="`${seg.length} ${C - seg.length}`" :stroke-dashoffset="seg.offset"/>
                </g>
                <text x="60" y="55" text-anchor="middle" font-size="20" font-weight="bold" fill="#111827"
                  :opacity="hoveredChart === summary.label ? 1 : 0" style="transition:opacity 0.2s">{{ summary.pendingApproval }}</text>
                <text x="60" y="67" text-anchor="middle" font-size="7.5" fill="#6b7280"
                  :opacity="hoveredChart === summary.label ? 1 : 0" style="transition:opacity 0.2s">Pending for</text>
                <text x="60" y="77" text-anchor="middle" font-size="7.5" fill="#6b7280"
                  :opacity="hoveredChart === summary.label ? 1 : 0" style="transition:opacity 0.2s">Approval</text>
              </svg>
            </div>
            <p class="mt-2 font-extrabold text-sm tracking-widest text-gray-800">{{ summary.label }}</p>
          </div>
        </div>

        <!-- Regular Tasks -->
        <section class="flex-1 min-h-0 bg-white rounded-xl shadow-sm p-4 flex flex-col">
          <h2 class="font-extrabold text-base tracking-widest mb-2 text-gray-800 flex-shrink-0">REGULAR TASKS</h2>
          <div v-if="regularTasks.length === 0" class="text-xs text-gray-400 italic">No regular tasks.</div>
          <div v-else class="flex gap-3 items-stretch">
            <div v-for="task in regularTasks" :key="task.id"
              class="flex-1 rounded p-3 bg-white text-sm shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              :class="task.highlight ? 'border-l-4 border-l-red-500' : ''" @click="openTask(task)">
              <p class="font-bold truncate" :class="task.highlight ? 'text-red-600' : 'text-gray-800'">{{ task.title }}</p>
              <p class="text-gray-500 text-xs italic mt-1">Submitted by {{ task.submittedBy }}</p>
              <p class="text-gray-500 text-xs italic">{{ task.taskGiven }}</p>
            </div>
            <div class="flex flex-col items-center justify-center px-2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <span class="text-3xl leading-none">›</span>
              <span class="text-xs">View more</span>
            </div>
          </div>
        </section>

        <!-- Insertion Tasks -->
        <section class="flex-1 min-h-0 bg-white rounded-xl shadow-sm p-4 flex flex-col">
          <h2 class="font-extrabold text-base tracking-widest mb-2 text-gray-800 flex-shrink-0">INSERTION TASKS</h2>
          <div v-if="insertionTasks.length === 0" class="text-xs text-gray-400 italic">No insertion tasks.</div>
          <div v-else class="flex gap-3 items-stretch">
            <div v-for="task in insertionTasks" :key="task.id"
              class="flex-1 rounded p-3 bg-white text-sm shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              :class="task.highlight ? 'border-l-4 border-l-red-500' : ''" @click="openTask(task)">
              <p class="font-bold truncate" :class="task.highlight ? 'text-red-600' : 'text-gray-800'">{{ task.title }}</p>
              <p class="text-gray-500 text-xs italic mt-1">Submitted by {{ task.submittedBy }}</p>
              <p class="text-gray-500 text-xs italic">{{ task.taskGiven }}</p>
            </div>
            <div class="flex flex-col items-center justify-center px-2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <span class="text-3xl leading-none">›</span>
              <span class="text-xs">View more</span>
            </div>
          </div>
        </section>

      </main>

      <!-- Notifications -->
      <aside class="w-60 border-l bg-white flex-shrink-0 flex flex-col overflow-hidden">
        <div class="px-4 pt-4 pb-2 flex-shrink-0">
          <h3 class="font-bold text-sm italic">Notifications</h3>
        </div>
        <div class="overflow-y-auto flex-1 px-4 pb-4">
          <div v-if="notifications.length === 0" class="text-xs text-gray-400 italic">No notifications.</div>
          <div v-for="(notif, i) in notifications" :key="i"
            class="mb-2 border border-gray-200 rounded p-3 text-xs shadow-sm">
            <p class="font-bold text-gray-800">{{ notif.from }}</p>
            <p class="text-gray-600">{{ notif.message }}</p>
            <p class="text-gray-400 mt-1">{{ notif.time }}</p>
          </div>
        </div>
      </aside>

    </div>

    <!-- Task Modal -->
    <div v-if="selectedTask" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="closeTask">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] mx-4 relative flex flex-col">

        <button class="absolute top-5 right-5 text-3xl text-gray-400 hover:text-gray-700 leading-none" @click="closeTask">×</button>

        <div class="px-8 pt-8 pb-4">
          <h2 class="text-2xl font-bold text-center text-gray-900 leading-snug">{{ selectedTask.fullTitle }}</h2>
        </div>
        <hr class="mx-8"/>

        <div class="flex gap-8 px-8 py-6 flex-1 overflow-hidden">

          <!-- No subtasks -->
          <template v-if="selectedTask.subtasks.length === 0">
            <div class="flex-1 min-w-0 flex flex-col">
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <div class="border border-gray-200 rounded-lg p-4 flex-1 text-sm text-gray-600 leading-relaxed">{{ selectedTask.description }}</div>
            </div>
            <div class="w-72 flex-shrink-0 flex flex-col gap-4">
              <div class="flex gap-2 flex-wrap">
                <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize" :class="badgeClass(selectedTask.progress)">{{ selectedTask.progress }}</span>
                <span v-if="selectedTask.urgency === 'urgent'" class="px-4 py-1.5 text-xs font-bold rounded-full capitalize" :class="badgeClass(selectedTask.urgency)">{{ selectedTask.urgency }}</span>
                <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize" :class="badgeClass(selectedTask.type)">{{ selectedTask.type }}</span>
              </div>
              <div class="text-sm text-gray-700 space-y-1">
                <p><span class="font-semibold">Task given on</span> {{ selectedTask.taskGiven }}</p>
                <p><span class="font-semibold">Submit before</span> {{ selectedTask.submitBefore }}</p>
              </div>
              <div class="flex gap-3">
                <div class="flex-1">
                  <p class="text-sm font-semibold text-gray-700 mb-1">Assigned by</p>
                  <div class="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                    <Icons :icon="'account'" class="text-gray-400"/>
                    <span class="text-xs text-gray-600 truncate">{{ selectedTask.assignedBy }}</span>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-gray-700 mb-1">Assigned to</p>
                  <div class="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                    <Icons :icon="'account'" class="text-gray-400"/>
                    <span class="text-xs text-gray-600 truncate">{{ selectedTask.assignedTo }}</span>
                  </div>
                </div>
              </div>
              <div v-if="selectedTask.status === 'approved'"
                class="relative flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg p-4 flex-1">
                <Icons :icon="'file'" class="text-gray-400 w-14 h-14"/>
                <a v-if="selectedTask.outputLink" :href="selectedTask.outputLink" target="_blank"
                  class="text-xs text-blue-600 hover:underline font-medium">View Output</a>
                <span v-else class="text-xs text-gray-400">No output uploaded</span>
              </div>
              <div v-else class="flex flex-col items-center justify-center gap-3 border border-gray-200 rounded-lg p-4 flex-1">
                <p class="text-sm text-gray-600 text-center"><span class="font-medium">{{ selectedTask.submittedBy }}</span> has submitted a task</p>
                <a v-if="selectedTask.outputLink" :href="selectedTask.outputLink" target="_blank"
                  class="px-6 py-2 rounded-full bg-green-950 text-white text-sm font-semibold hover:bg-green-800 transition-colors">view file</a>
                <button v-else class="px-6 py-2 rounded-full bg-green-950 text-white text-sm font-semibold hover:bg-green-800 transition-colors">view file</button>
              </div>
            </div>
          </template>

          <!-- Has subtasks -->
          <template v-else>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <div class="border border-gray-200 rounded-lg p-4 mb-5 min-h-28 text-sm text-gray-600">{{ selectedTask.description }}</div>
              <div class="flex gap-2 mb-5">
                <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize" :class="badgeClass(selectedTask.progress)">{{ selectedTask.progress }}</span>
                <span v-if="selectedTask.urgency === 'urgent'" class="px-4 py-1.5 text-xs font-bold rounded-full capitalize" :class="badgeClass(selectedTask.urgency)">{{ selectedTask.urgency }}</span>
                <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize" :class="badgeClass(selectedTask.type)">{{ selectedTask.type }}</span>
              </div>
              <p class="text-sm text-gray-700 italic">Task given on <span class="font-semibold">{{ selectedTask.taskGiven }}</span></p>
              <p class="text-sm text-gray-700 italic mb-5">Submit before <span class="font-semibold">{{ selectedTask.submitBefore }}</span></p>
              <div class="flex gap-8">
                <div>
                  <p class="text-sm font-semibold text-gray-700 mb-2">Assigned by</p>
                  <div class="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2">
                    <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><Icons :icon="'account'" class="text-gray-400"/></div>
                    <span class="text-xs text-gray-600">{{ selectedTask.assignedBy }}</span>
                  </div>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-700 mb-2">Assigned to</p>
                  <div class="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2">
                    <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><Icons :icon="'account'" class="text-gray-400"/></div>
                    <span class="text-xs text-gray-600">{{ selectedTask.assignedTo }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="w-72 shrink-0 flex flex-col overflow-hidden">
              <h3 class="text-sm font-semibold text-gray-700 mb-2 flex-shrink-0">Sub-tasks</h3>
              <div class="overflow-y-auto flex-1">
                <div v-for="(sub, i) in selectedTask.subtasks" :key="i"
                  class="flex items-center gap-3 border border-gray-200 rounded-lg p-3 mb-2 hover:bg-gray-50 cursor-pointer">
                  <p class="flex-1 text-xs text-gray-700 leading-snug">{{ sub }}</p>
                  <span class="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-600 text-white text-xs font-bold flex-shrink-0">›</span>
                </div>
              </div>
            </div>
          </template>

        </div>

        <div v-if="selectedTask.status !== 'approved'" class="flex justify-end gap-3 px-8 pb-6">
          <template v-if="selectedTask.subtasks.length === 0">
            <button class="px-6 py-2 rounded-full border-2 border-yellow-500 text-yellow-600 font-bold text-sm hover:bg-yellow-50 transition-colors">Revise</button>
            <button class="px-6 py-2 rounded-full bg-green-950 text-white font-bold text-sm hover:bg-green-800 transition-colors" @click="approveTask">Approve</button>
          </template>
          <template v-else>
            <button class="px-6 py-2 rounded-lg border-2 border-red-500 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors">Revise All</button>
            <button class="px-6 py-2 rounded-lg bg-green-900 text-white font-bold text-sm hover:bg-green-800 transition-colors" @click="approveTask">Approve All</button>
          </template>
        </div>

      </div>
    </div>

  </div>
</template>