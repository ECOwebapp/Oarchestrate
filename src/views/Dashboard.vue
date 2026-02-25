<script setup vapor>
import { ref, computed } from 'vue'

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

// Task data with full details for modal
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
    taskGiven: 'Month dd, yyyy',
    submitBefore: 'Month dd, yyyy',
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
    highlight: false,
    type: 'regular',
    progress: 'ongoing',
    urgency: 'regular',
    taskGiven: 'Month dd, yyyy',
    submitBefore: 'Month dd, yyyy',
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
    taskGiven: 'Month dd, yyyy',
    submitBefore: 'Month dd, yyyy',
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
    taskGiven: 'Month dd, yyyy',
    submitBefore: 'Month dd, yyyy',
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
    taskGiven: 'Month dd, yyyy',
    submitBefore: 'Month dd, yyyy',
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
    taskGiven: 'Month dd, yyyy',
    submitBefore: 'Month dd, yyyy',
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
    taskGiven: 'Month dd, yyyy',
    submitBefore: 'Month dd, yyyy',
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
    taskGiven: 'Month dd, yyyy',
    submitBefore: 'Month dd, yyyy',
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

// Modal state
const selectedTask = ref(null)
const openTask = (task) => { selectedTask.value = task }
const closeTask = () => { selectedTask.value = null }

const badgeClass = (value) => {
  const map = {
    ongoing:   'bg-green-800 text-white',
    completed: 'bg-gray-500 text-white',
    urgent:    'bg-[#7b1c1c] text-white',
    regular:   'bg-amber-500 text-white',
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

    <!-- Header -->
    <header class="flex items-center justify-between bg-green-900 px-8 py-4 flex-shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-white">Dashboard</h1>
        <p class="text-sm text-green-200 italic">View summary of analytics and tasks.</p>
      </div>
    </header>

    <!-- Body -->
    <div class="flex flex-1 min-h-0 overflow-hidden">

      <!-- Main Content -->
      <main class="flex-1 bg-gray-50 p-6 overflow-hidden">

        <!-- Donut Charts -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6 flex justify-around">
          <div
            v-for="summary in taskSummaries"
            :key="summary.label"
            class="flex flex-col items-center cursor-pointer"
            @mouseenter="hoveredChart = summary.label"
            @mouseleave="hoveredChart = null"
          >
            <div class="relative w-44 h-44 flex items-center justify-center">
              <!-- Pending label: top-right, only on hover -->
              <span
                class="absolute top-1 right-0 text-xs text-right leading-tight transition-opacity duration-200"
                :class="hoveredChart === summary.label ? 'opacity-100' : 'opacity-0'"
              >
                <span class="text-gray-600 font-semibold">{{ summary.pending }}</span><br />
                <span class="text-gray-400">Pending</span>
              </span>
              <!-- Approved label: bottom-left, only on hover -->
              <span
                class="absolute bottom-1 left-0 text-xs leading-tight transition-opacity duration-200"
                :class="hoveredChart === summary.label ? 'opacity-100' : 'opacity-0'"
              >
                <span class="text-gray-600 font-semibold">{{ summary.approved }}</span><br />
                <span class="text-gray-400">Approved</span>
              </span>
              <!-- SVG Donut -->
              <svg width="130" height="130" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#e5e7eb" stroke-width="14" />
                <g transform="rotate(-90 60 60)">
                  <circle
                    v-for="(seg, i) in getSegments(summary.approved, summary.pendingApproval, summary.pending)"
                    :key="i"
                    cx="60" cy="60" r="45"
                    fill="none"
                    :stroke="seg.color"
                    stroke-width="14"
                    :stroke-dasharray="`${seg.length} ${C - seg.length}`"
                    :stroke-dashoffset="seg.offset"
                  />
                </g>
                <!-- Center numbers: only on hover -->
                <text
                  x="60" y="55"
                  text-anchor="middle"
                  font-size="20"
                  font-weight="bold"
                  fill="#111827"
                  :opacity="hoveredChart === summary.label ? 1 : 0"
                  style="transition: opacity 0.2s"
                >{{ summary.pendingApproval }}</text>
                <text
                  x="60" y="67"
                  text-anchor="middle"
                  font-size="7.5"
                  fill="#6b7280"
                  :opacity="hoveredChart === summary.label ? 1 : 0"
                  style="transition: opacity 0.2s"
                >Pending for</text>
                <text
                  x="60" y="77"
                  text-anchor="middle"
                  font-size="7.5"
                  fill="#6b7280"
                  :opacity="hoveredChart === summary.label ? 1 : 0"
                  style="transition: opacity 0.2s"
                >Approval</text>
              </svg>
            </div>
            <p class="mt-2 font-extrabold text-sm tracking-widest text-gray-800">{{ summary.label }}</p>
          </div>
        </div>

        <!-- Regular Tasks -->
        <section class="bg-white rounded-xl shadow-sm p-5 mb-4">
          <h2 class="font-extrabold text-base tracking-widest mb-3 text-gray-800">REGULAR TASKS</h2>
          <div class="flex gap-3 items-stretch">
            <div
              v-for="(task, i) in regularTasks" :key="i"
              class="flex-1 rounded p-3 bg-white text-sm shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              :class="task.highlight ? 'border-l-4 border-l-red-500' : ''"
              @click="openTask(task)"
            >
              <p class="font-bold truncate" :class="task.highlight ? 'text-red-600' : 'text-gray-800'">{{ task.title }}</p>
              <p class="text-gray-500 text-xs italic mt-1">Submitted by {{ task.submittedBy }}</p>
              <p class="text-gray-500 text-xs italic">Submitted on {{ task.submittedOn }}</p>
            </div>
            <div class="flex flex-col items-center justify-center px-2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <span class="text-3xl leading-none">›</span>
              <span class="text-xs">View more</span>
            </div>
          </div>
        </section>

        <!-- Insertion Tasks -->
        <section class="bg-white rounded-xl shadow-sm p-5">
          <h2 class="font-extrabold text-base tracking-widest mb-3 text-gray-800">INSERTION TASKS</h2>
          <div class="flex gap-3 items-stretch">
            <div
              v-for="(task, i) in insertionTasks" :key="i"
              class="flex-1 rounded p-3 bg-white text-sm shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
              :class="task.highlight ? 'border-l-4 border-l-red-500' : ''"
              @click="openTask(task)"
            >
              <p class="font-bold truncate" :class="task.highlight ? 'text-red-600' : 'text-gray-800'">{{ task.title }}</p>
              <p class="text-gray-500 text-xs italic mt-1">Submitted by {{ task.submittedBy }}</p>
              <p class="text-gray-500 text-xs italic">Submitted on {{ task.submittedOn }}</p>
            </div>
            <div class="flex flex-col items-center justify-center px-2 text-gray-400 hover:text-gray-600 cursor-pointer">
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
          <div
            v-for="(notif, i) in notifications" :key="i"
            class="mb-2 border border-gray-200 rounded p-3 text-xs shadow-sm"
          >
            <p class="font-bold text-gray-800">{{ notif.from }}</p>
            <p class="text-gray-600">{{ notif.message }}</p>
            <p class="text-gray-400 mt-1">{{ notif.time }}</p>
          </div>
        </div>
      </aside>

    </div>

    <!-- Footer -->
    <footer class="flex-shrink-0 bg-green-900 text-white text-center py-2 text-xs w-full">
      <p class="font-bold">Bugsay, Engineering and Construction Office</p>
      <p>© Caraga State University 2026</p>
    </footer>

    <!-- Task Detail Modal -->
    <div
      v-if="selectedTask"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="closeTask"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] mx-4 relative flex flex-col">

        <!-- Close button -->
        <button
          class="absolute top-5 right-5 text-3xl text-gray-400 hover:text-gray-700 leading-none"
          @click="closeTask"
        >×</button>

        <!-- Title -->
        <div class="px-8 pt-8 pb-4">
          <h2 class="text-2xl font-bold text-center text-gray-900 leading-snug">{{ selectedTask.fullTitle }}</h2>
        </div>

        <hr class="mx-8" />

        <!-- Body -->
        <div class="flex gap-8 px-8 py-6 flex-1 overflow-hidden">

          <!-- Left column -->
          <div class="flex-1 min-w-0">
            <!-- Description -->
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <div class="border border-gray-200 rounded-lg p-4 mb-5 min-h-28 text-sm text-gray-600">
              {{ selectedTask.description }}
            </div>

            <!-- Badges -->
            <div class="flex gap-2 mb-5">
              <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize" :class="badgeClass(selectedTask.progress)">
                {{ selectedTask.progress }}
              </span>
              <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize" :class="badgeClass(selectedTask.urgency)">
                {{ selectedTask.urgency }}
              </span>
              <span class="px-4 py-1.5 text-xs font-bold rounded-full capitalize" :class="badgeClass(selectedTask.type)">
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
                    <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                  </div>
                  <span class="text-xs text-gray-600">{{ selectedTask.assignedBy }}</span>
                </div>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-700 mb-2">Assigned to</p>
                <div class="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2">
                  <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
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
            <div v-if="selectedTask.subtasks.length === 0" class="text-sm text-gray-400 italic">No sub-tasks</div>
            <div
              v-for="(sub, i) in selectedTask.subtasks" :key="i"
              class="flex items-center gap-3 border border-gray-200 rounded-lg p-3 mb-2 hover:bg-gray-50 cursor-pointer"
            >
              <p class="flex-1 text-xs text-gray-700 leading-snug">{{ sub }}</p>
              <span class="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-600 text-white text-xs font-bold flex-shrink-0">›</span>
            </div>
            </div>
          </div>

        </div>

        <!-- Footer buttons -->
        <div class="flex justify-end gap-3 px-8 pb-6">
          <button class="px-6 py-2 rounded-lg border-2 border-red-500 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors">
            Revise All
          </button>
          <button class="px-6 py-2 rounded-lg bg-green-900 text-white font-bold text-sm hover:bg-green-800 transition-colors">
            Approve All
          </button>
        </div>

      </div>
    </div>

  </div>
</template>