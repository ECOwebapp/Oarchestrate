<script setup vapor>
import { ref, computed } from 'vue'
import Icons from '@/components/Icons.vue'

const r = 45
const C = 2 * Math.PI * r

const getSegments = (approved, pendingApproval, pending) => {
  const total = approved + pendingApproval + pending
  if (total === 0) return []
  const approvedLen = C * (approved / total)
  const pendingApprovalLen = C * (pendingApproval / total)
  const pendingLen = C * (pending / total)
  return [
    { color: '#16a34a', length: approvedLen, offset: 0 },
    { color: '#eab308', length: pendingApprovalLen, offset: -approvedLen },
    { color: '#d1d5db', length: pendingLen, offset: -(approvedLen + pendingApprovalLen) },
  ]
}

const getDue = (task) => {
  const today = new Date()
  const target = new Date(task.submitBefore)
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  return diffDays
}

const getProgress = (task) => {
  const start = new Date(task.taskGiven).getTime()
  const end = new Date(task.submitBefore).getTime()
  const now = Date.now()
  if (now < start) return 0
  if (now > end) return 100
  return Math.round(((now - start) / (end - start)) * 100)
}

const regularTasks = ref([
  {
    title: 'ESTABLISHMENT OF THE ECO INT...',
    fullTitle: 'Establishment of the Eco International Center',
    description: 'This is the description of the main task',
    submittedBy: '<Unit Member Name>',
    submittedOn: '<Date Submitted>, <Time Submitted>',
    status: 'pending_approval',
    highlight: true,
    type: 'regular',
    progress: 'ongoing',
    urgency: 'urgent',
    taskGiven: '2026-02-20',
    submitBefore: '2026-03-05',
    assignedBy: '<Unit Member Name>',
    assignedTo: '<Unit Member Name>',
    subtasks: [
      'This is the description of the subtask. Click the button to view every individual subtask.',
      'Task approval can be done as a whole or individual. Click Approve all below or click Approve on individual task.',
      'The Director may order a revision on each subtask or the whole main task.',
    ],
  },
  {
    title: 'ESTABLISHMENT OF THE ECO INT...',
    fullTitle: 'Establishment of the Eco International Center',
    description: 'This is the description of the main task',
    submittedBy: '<Unit Member Name>',
    submittedOn: '<Date Submitted>, <Time Submitted>',
    status: 'approved',
    highlight: true,
    type: 'regular',
    progress: 'ongoing',
    urgency: 'urgent',
    taskGiven: '2026-02-10',
    submitBefore: '2026-03-01',
    assignedBy: '<Unit Member Name>',
    assignedTo: '<Unit Member Name>',
    subtasks: [
      'This is the description of the subtask. Click the button to view every individual subtask.',
    ],
  },
  {
    title: 'ESTABLISHMENT OF THE ECO INT...',
    fullTitle: 'Establishment of the Eco International Center',
    description: 'This is the description of the main task',
    submittedBy: '<Unit Member Name>',
    submittedOn: '<Date Submitted>, <Time Submitted>',
    status: 'approved',
    highlight: false,
    type: 'regular',
    progress: 'ongoing',
    urgency: 'regular',
    taskGiven: '2026-02-25',
    submitBefore: '2026-03-10',
    assignedBy: '<Unit Member Name>',
    assignedTo: '<Unit Member Name>',
    subtasks: [],
  },
])

const urgentTasks = ref([
  {
    title: 'URGENT TASK SAMPLE',
    fullTitle: 'Urgent Task Sample',
    description: 'This is the description of the main task',
    submittedBy: '<Unit Member Name>',
    submittedOn: '<Date Submitted>, <Time Submitted>',
    status: 'pending_approval',
    highlight: true,
    type: 'regular',
    progress: 'ongoing',
    urgency: 'urgent',
    taskGiven: '2026-02-25',
    submitBefore: '2026-03-04',
    assignedBy: '<Unit Member Name>',
    assignedTo: '<Unit Member Name>',
    subtasks: ['Subtask description here.'],
  },
  {
    title: 'URGENT TASK SAMPLE 2',
    fullTitle: 'Urgent Task Sample 2',
    description: 'This is the description of the main task',
    submittedBy: '<Unit Member Name>',
    submittedOn: '<Date Submitted>, <Time Submitted>',
    status: 'approved',
    highlight: false,
    type: 'regular',
    progress: 'ongoing',
    urgency: 'regular',
    taskGiven: '2026-02-15',
    submitBefore: '2026-03-08',
    assignedBy: '<Unit Member Name>',
    assignedTo: '<Unit Member Name>',
    subtasks: [],
  },
])

const insertionTasks = ref([
  {
    title: 'Preparations for the upcoming...',
    fullTitle: 'Preparation for the upcoming State Opening of Parliament',
    description: 'This is the description of the main task',
    submittedBy: '<Unit Member Name>',
    submittedOn: '<Date Submitted>, <Time Submitted>',
    status: 'pending_approval',
    highlight: true,
    type: 'insertion',
    progress: 'ongoing',
    urgency: 'urgent',
    taskGiven: '2026-02-22',
    submitBefore: '2026-03-02',
    assignedBy: '<Unit Member Name>',
    assignedTo: '<Unit Member Name>',
    subtasks: [
      'This is the description of the subtask. Click the button to view every individual subtask.',
      'Task approval can be done as a whole or individual. Click Approve all below or click Approve on individual task.',
      'The Director may order a revision on each subtask or the whole main task.',
      'The description of subtasks should be short and precise. These subtasks are assigned by the Director himself.',
      'This modal is only available when the Unit Head submit the whole task.',
      'The same feature is also available on Design Tasks. Just click the button.',
      'This is the description of the subtask. Click the button to add task and pre-fill the contents of this subtask.',
    ],
  },
  {
    title: 'Create a task in the table',
    fullTitle: 'Create a task in the table',
    description: 'This is the description of the main task',
    submittedBy: '<Unit Member Name>',
    submittedOn: '<Date Submitted>, <Time Submitted>',
    status: 'pending',
    highlight: false,
    type: 'insertion',
    progress: 'ongoing',
    urgency: 'regular',
    taskGiven: '2026-02-28',
    submitBefore: '2026-03-15',
    assignedBy: '<Unit Member Name>',
    assignedTo: '<Unit Member Name>',
    subtasks: [],
  },
  {
    title: 'ESTABLISHMENT OF THE ECO INT...',
    fullTitle: 'Establishment of the Eco International Center',
    description: 'This is the description of the main task',
    submittedBy: '<Unit Member Name>',
    submittedOn: '<Date Submitted>, <Time Submitted>',
    status: 'approved',
    highlight: false,
    type: 'insertion',
    progress: 'ongoing',
    urgency: 'regular',
    taskGiven: '2026-02-18',
    submitBefore: '2026-03-06',
    assignedBy: '<Unit Member Name>',
    assignedTo: '<Unit Member Name>',
    subtasks: [],
  },
])

const countBy = (tasks, status) => tasks.value.filter(t => t.status === status).length

const taskSummaries = computed(() => [
  {
    label: 'REGULAR TASKS',
    approved: countBy(regularTasks, 'approved'),
    pendingApproval: countBy(regularTasks, 'pending_approval'),
    pending: countBy(regularTasks, 'pending'),
  },
  {
    label: 'URGENT TASKS',
    approved: countBy(urgentTasks, 'approved'),
    pendingApproval: countBy(urgentTasks, 'pending_approval'),
    pending: countBy(urgentTasks, 'pending'),
  },
  {
    label: 'INSERTION TASKS',
    approved: countBy(insertionTasks, 'approved'),
    pendingApproval: countBy(insertionTasks, 'pending_approval'),
    pending: countBy(insertionTasks, 'pending'),
  },
])

const hoveredChart = ref(null)

const selectedTask = ref(null)
const openTask = (task) => {
  if (task.status === 'approved') task.progress = 'completed'
  selectedTask.value = task
}
const closeTask = () => { selectedTask.value = null }
const approveTask = () => {
  if (selectedTask.value) {
    selectedTask.value.progress = 'completed'
    selectedTask.value.status = 'approved'
  }
}

const badgeClass = (value) => {
  const map = {
    ongoing: 'bg-green-800 text-white',
    completed: 'bg-blue-600 text-white',
    urgent: 'bg-[#7b1c1c] text-white',
    regular: 'bg-amber-500 text-white',
    insertion: 'bg-[#7b1c1c] text-white',
  }
  return map[value] || 'bg-gray-300 text-gray-800'
}

const notifications = [
  { from: 'Nheron Cedro', message: 'has poked you for Task 1', time: '10 minutes ago' },
  { from: '<Unit Member Name>', message: 'has poked you for <task name>', time: '<time> ago' },
  { from: '<Unit Member Name>', message: 'has poked you for <task name>', time: '<time> ago' },
  { from: '<Unit Member Name>', message: 'has poked you for <task name>', time: '<time> ago' },
  { from: '<Unit Member Name>', message: 'has poked you for <task name>', time: '<time> ago' },
  { from: '<Unit Member Name>', message: 'has poked you for <task name>', time: '<time> ago' },
  { from: '<Unit Member Name>', message: 'has poked you for <task name>', time: '<time> ago' },
  { from: '<Unit Member Name>', message: 'has poked you for <task name>', time: '<time> ago' },
]
</script>

<template>
  <div class="flex flex-col w-full h-full">

    <div class="flex flex-1 min-h-0 overflow-hidden">

      <main class="flex-1 bg-gray-50 p-4 overflow-hidden flex flex-col gap-3">

        <!-- Donut Charts -->
        <div class="flex-shrink-0 bg-white rounded-xl shadow-sm p-3 flex justify-around">
          <div v-for="summary in taskSummaries" :key="summary.label" class="flex flex-col items-center cursor-pointer"
            @mouseenter="hoveredChart = summary.label" @mouseleave="hoveredChart = null">
            <div class="relative w-44 h-44 flex items-center justify-center">
              <!-- Pending label: top-right, only on hover -->
              <span class="absolute top-1 right-0 text-xs text-right leading-tight transition-opacity duration-200"
                :class="hoveredChart === summary.label ? 'opacity-100' : 'opacity-0'">
                <span class="text-gray-600 font-semibold">{{ summary.pending }}</span><br />
                <span class="text-gray-400">Pending</span>
              </span>
              <!-- Approved label: bottom-left, only on hover -->
              <span class="absolute bottom-1 left-0 text-xs leading-tight transition-opacity duration-200"
                :class="hoveredChart === summary.label ? 'opacity-100' : 'opacity-0'">
                <span class="text-gray-600 font-semibold">{{ summary.approved }}</span><br />
                <span class="text-gray-400">Approved</span>
              </span>
              <!-- SVG Donut -->
              <svg width="140" height="140" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" stroke-width="14" />
                <g transform="rotate(-90 60 60)">
                  <circle v-for="(seg, i) in getSegments(summary.approved, summary.pendingApproval, summary.pending)"
                    :key="i" cx="60" cy="60" r="45" fill="none" :stroke="seg.color" stroke-width="14"
                    :stroke-dasharray="`${seg.length} ${C - seg.length}`" :stroke-dashoffset="seg.offset" />
                </g>
                <!-- Center numbers: only on hover -->
                <text x="60" y="55" text-anchor="middle" font-size="20" font-weight="bold" fill="#111827"
                  :opacity="hoveredChart === summary.label ? 1 : 0" style="transition: opacity 0.2s">{{
                    summary.pendingApproval }}</text>
                <text x="60" y="67" text-anchor="middle" font-size="7.5" fill="#6b7280"
                  :opacity="hoveredChart === summary.label ? 1 : 0" style="transition: opacity 0.2s">Pending for</text>
                <text x="60" y="77" text-anchor="middle" font-size="7.5" fill="#6b7280"
                  :opacity="hoveredChart === summary.label ? 1 : 0" style="transition: opacity 0.2s">Approval</text>
              </svg>
            </div>
            <p class="mt-2 font-extrabold text-sm tracking-widest text-gray-800">{{ summary.label }}</p>
          </div>
        </div>

        <!-- Regular Tasks -->
        <section class="flex-1 min-h-0 bg-white rounded-xl shadow-sm p-4 flex flex-col">
          <h2 class="font-extrabold text-base tracking-widest mb-2 text-gray-800 flex-shrink-0">REGULAR TASKS</h2>
          <div class="flex gap-3 items-stretch">
            <div v-for="(task, i) in regularTasks" :key="i"
              class="relative flex flex-col flex-1 min-w-70 h-28 rounded-2xl py-2 px-4 overflow-hidden bg-white cursor-pointer transition-shadow"
              :class="task.urgency === 'urgent'
                ? 'outline-3 outline-red-900 text-red-900 shadow-md shadow-red-900/90 hover:shadow-lg hover:shadow-red-900/70'
                : 'outline-2 outline-green-950 text-green-950 shadow-md shadow-green-950/90 hover:shadow-lg hover:shadow-green-950/70'"
              @click="openTask(task)">
              <!-- Urgent Ribbon -->
              <div v-if="task.urgency === 'urgent'" class="absolute top-0 right-0 h-16 w-16">
                <div class="absolute transform rotate-45 bg-red-800 text-white text-1xl font-bold py-1 w-40 bottom-4 -right-12 text-center shadow-sm uppercase">
                  Urgent
                </div>
              </div>
              <p class="truncate uppercase font-bold mb-2">{{ task.title }}</p>
              <p class="line-clamp-2 italic text-sm">{{ task.description }}</p>
              <div class="flex flex-row items-center justify-evenly mt-auto gap-1">
                <div class="w-40 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div class="h-full transition-all duration-500 ease-out"
                    :class="task.urgency === 'urgent' ? 'bg-red-800' : 'bg-green-950'"
                    :style="{ width: getProgress(task) + '%' }">
                  </div>
                </div>
                <div>
                  <p class="text-xs font-bold italic">
                    {{ getDue(task) >= 0 ? 'Due' : 'Overdue' }}:
                    {{ getDue(task) < 0 ? getDue(task) * -1 : getDue(task) !== 0 ? getDue(task) : 'Today' }} {{ getDue(task) > 1 ||
                        getDue(task) * -1 > 1 ? 'days' : 'day' }}</p>
                </div>
              </div>
            </div>
            <div
              class="flex flex-col items-center justify-center px-2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <span class="text-3xl leading-none">›</span>
              <span class="text-xs">View more</span>
            </div>
          </div>
        </section>

        <!-- Insertion Tasks -->
        <section class="flex-1 min-h-0 bg-white rounded-xl shadow-sm p-4 flex flex-col">
          <h2 class="font-extrabold text-base tracking-widest mb-2 text-gray-800 flex-shrink-0">INSERTION TASKS</h2>
          <div class="flex gap-3 items-stretch">
            <div v-for="(task, i) in insertionTasks" :key="i"
              class="relative flex flex-col flex-1 min-w-70 h-28 rounded-2xl py-2 px-4 overflow-hidden bg-white cursor-pointer transition-shadow"
              :class="task.urgency === 'urgent'
                ? 'outline-3 outline-red-900 text-red-900 shadow-md shadow-red-900/90 hover:shadow-lg hover:shadow-red-900/70'
                : 'outline-2 outline-green-950 text-green-950 shadow-md shadow-green-950/90 hover:shadow-lg hover:shadow-green-950/70'"
              @click="openTask(task)">
              <!-- Urgent Ribbon -->
              <div v-if="task.urgency === 'urgent'" class="absolute top-0 right-0 h-16 w-16">
                <div class="absolute transform rotate-45 bg-red-800 text-white text-1xl font-bold py-1 w-40 bottom-4 -right-12 text-center shadow-sm uppercase">
                  Urgent
                </div>
              </div>
              <p class="truncate uppercase font-bold mb-2">{{ task.title }}</p>
              <p class="line-clamp-2 italic text-sm">{{ task.description }}</p>
              <div class="flex flex-row items-center justify-evenly mt-auto gap-1">
                <div class="w-40 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div class="h-full transition-all duration-500 ease-out"
                    :class="task.urgency === 'urgent' ? 'bg-red-800' : 'bg-green-950'"
                    :style="{ width: getProgress(task) + '%' }">
                  </div>
                </div>
                <div>
                  <p class="text-xs font-bold italic">
                    {{ getDue(task) >= 0 ? 'Due' : 'Overdue' }}:
                    {{ getDue(task) < 0 ? getDue(task) * -1 : getDue(task) !== 0 ? getDue(task) : 'Today' }} {{ getDue(task) > 1 ||
                        getDue(task) * -1 > 1 ? 'days' : 'day' }}</p>
                </div>
              </div>
            </div>
            <div
              class="flex flex-col items-center justify-center px-2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <span class="text-3xl leading-none">›</span>
              <span class="text-xs">View more</span>
            </div>
          </div>
        </section>

      </main>

      <!-- Notifications Panel -->
      <aside class="w-60 border-l bg-white flex-shrink-0 flex flex-col overflow-hidden">
        <div class="px-4 pt-4 pb-2 flex-shrink-0">
          <h3 class="font-bold text-sm italic">Notifications</h3>
        </div>
        <div class="overflow-y-auto flex-1 px-4 pb-4">
          <div v-for="(notif, i) in notifications" :key="i"
            class="mb-2 border border-gray-200 rounded p-3 text-xs shadow-sm">
            <p class="font-bold text-gray-800">{{ notif.from }}</p>
            <p class="text-gray-600">{{ notif.message }}</p>
            <p class="text-gray-400 mt-1">{{ notif.time }}</p>
          </div>
        </div>
      </aside>

    </div>

    <!-- Task Detail Modal -->
    <div v-if="selectedTask" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="closeTask">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] mx-4 relative flex flex-col">

        <!-- Close button -->
        <button class="absolute top-5 right-5 text-3xl text-gray-400 hover:text-gray-700 leading-none"
          @click="closeTask">×</button>

        <!-- Title -->
        <div class="px-8 pt-8 pb-4">
          <h2 class="text-2xl font-bold text-center text-gray-900 leading-snug">{{ selectedTask.fullTitle }}</h2>
        </div>

        <hr class="mx-8" />

        <!-- Body -->
        <div class="flex gap-8 px-8 py-6 flex-1 overflow-hidden">

          <!-- ── SINGLE TASK (no subtasks) ── -->
          <template v-if="selectedTask.subtasks.length === 0">

            <!-- Left: Description fills full height -->
            <div class="flex-1 min-w-0 flex flex-col">
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <div class="border border-gray-200 rounded-lg p-4 flex-1 text-sm text-gray-600 leading-relaxed">
                {{ selectedTask.description }}
              </div>
            </div>

            <!-- Right: badges · dates · assigned · submission -->
            <div class="w-72 flex-shrink-0 flex flex-col gap-4">

              <!-- Badges -->
              <div class="flex gap-2 flex-wrap">
                <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize"
                  :class="badgeClass(selectedTask.progress)">
                  {{ selectedTask.progress }}
                </span>
                <span v-if="selectedTask.urgency === 'urgent'" class="px-4 py-1.5 text-xs font-bold rounded-full capitalize"
                  :class="badgeClass(selectedTask.urgency)">
                  {{ selectedTask.urgency }}
                </span>
                <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize"
                  :class="badgeClass(selectedTask.type)">
                  {{ selectedTask.type }}
                </span>
              </div>

              <!-- Dates -->
              <div class="text-sm text-gray-700 space-y-1">
                <p><span class="font-semibold">Task given on</span> {{ selectedTask.taskGiven }}</p>
                <p><span class="font-semibold">Submit before</span> {{ selectedTask.submitBefore }}</p>
              </div>

              <!-- Assigned by / Assigned to -->
              <div class="flex gap-3">
                <div class="flex-1">
                  <p class="text-sm font-semibold text-gray-700 mb-1">Assigned by</p>
                  <div class="flex items-center justify-center border border-gray-200 rounded-lg h-12">
                    <Icons :icon="'account'" class="text-gray-400" />
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-gray-700 mb-1">Assigned to</p>
                  <div class="flex items-center justify-center border border-gray-200 rounded-lg h-12">
                    <Icons :icon="'account'" class="text-gray-400" />
                  </div>
                </div>
              </div>

              <!-- Submission area -->
              <!-- Approved: file attachment preview -->
              <div v-if="selectedTask.status === 'approved'"
                class="relative flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-lg p-4 flex-1">
                <Icons :icon="'attachment'" class="absolute top-2 right-2 text-gray-400 w-4 h-4" />
                <Icons :icon="'file'" class="text-gray-400 w-14 h-14" />
                <div class="flex items-center justify-between w-full text-xs text-gray-600 px-1">
                  <span class="font-medium">{{ selectedTask.submittedFile?.name || 'Task_submission.pdf' }}</span>
                  <span class="text-gray-400">{{ selectedTask.submittedFile?.size || '8.00 MB' }}</span>
                </div>
              </div>
              <!-- Pending: submitted message + view file button -->
              <div v-else
                class="flex flex-col items-center justify-center gap-3 border border-gray-200 rounded-lg p-4 flex-1">
                <p class="text-sm text-gray-600 text-center">
                  <span class="font-medium">{{ selectedTask.submittedBy }}</span> has submitted a task
                </p>
                <button class="px-6 py-2 rounded-full bg-green-950 text-white text-sm font-semibold hover:bg-green-800 transition-colors">
                  view file
                </button>
              </div>

            </div>
          </template>

          <!-- ── BULK TASK (has subtasks) ── -->
          <template v-else>

            <!-- Left column -->
            <div class="flex-1 min-w-0">
              <!-- Description -->
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <div class="border border-gray-200 rounded-lg p-4 mb-5 min-h-28 text-sm text-gray-600">
                {{ selectedTask.description }}
              </div>

              <!-- Badges -->
              <div class="flex gap-2 mb-5">
                <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize"
                  :class="badgeClass(selectedTask.progress)">
                  {{ selectedTask.progress }}
                </span>
                <span v-if="selectedTask.urgency === 'urgent'" class="px-4 py-1.5 text-xs font-bold rounded-full capitalize"
                  :class="badgeClass(selectedTask.urgency)">
                  {{ selectedTask.urgency }}
                </span>
                <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize"
                  :class="badgeClass(selectedTask.type)">
                  {{ selectedTask.type }}
                </span>
              </div>

              <!-- Dates -->
              <p class="text-sm text-gray-700 italic">Task given on <span class="font-semibold">{{ selectedTask.taskGiven }}</span></p>
              <p class="text-sm text-gray-700 italic mb-5">Submit before <span class="font-semibold">{{ selectedTask.submitBefore }}</span></p>

              <!-- Assigned -->
              <div class="flex gap-8">
                <div>
                  <p class="text-sm font-semibold text-gray-700 mb-2">Assigned by</p>
                  <div class="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2">
                    <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Icons :icon="'account'" class="text-gray-400" />
                    </div>
                    <span class="text-xs text-gray-600">{{ selectedTask.assignedBy }}</span>
                  </div>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-700 mb-2">Assigned to</p>
                  <div class="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2">
                    <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <Icons :icon="'account'" class="text-gray-400" />
                    </div>
                    <span class="text-xs text-gray-600">{{ selectedTask.assignedTo }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right column: Sub-tasks -->
            <div class="w-72 flex-shrink-0 flex flex-col overflow-hidden">
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

        <!-- Footer buttons (hidden once approved) -->
        <div v-if="selectedTask.status !== 'approved'" class="flex justify-end gap-3 px-8 pb-6">
          <template v-if="selectedTask.subtasks.length === 0">
            <button class="px-6 py-2 rounded-full border-2 border-yellow-500 text-yellow-600 font-bold text-sm hover:bg-yellow-50 transition-colors">
              Revise
            </button>
            <button class="px-6 py-2 rounded-full bg-green-950 text-white font-bold text-sm hover:bg-green-800 transition-colors"
              @click="approveTask">
              Approve
            </button>
          </template>
          <template v-else>
            <button class="px-6 py-2 rounded-lg border-2 border-red-500 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors">
              Revise All
            </button>
            <button class="px-6 py-2 rounded-lg bg-green-900 text-white font-bold text-sm hover:bg-green-800 transition-colors"
              @click="approveTask">
              Approve All
            </button>
          </template>
        </div>

      </div>
    </div>

  </div>
</template>