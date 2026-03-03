<script setup vapor>
import { ref, computed } from 'vue'
import TaskCard from '@/components/TaskCard.vue'
import TaskDetailModal from '@/components/TaskDetailModal.vue'

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
            <TaskCard v-for="(task, i) in regularTasks" :key="i"
              :name="task.title" :description="task.description"
              :urgent="task.urgency === 'urgent'" :progress="getProgress(task)" :due="getDue(task)"
              class="flex-1 cursor-pointer" @click="openTask(task)" />
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
            <TaskCard v-for="(task, i) in insertionTasks" :key="i"
              :name="task.title" :description="task.description"
              :urgent="task.urgency === 'urgent'" :progress="getProgress(task)" :due="getDue(task)"
              class="flex-1 cursor-pointer" @click="openTask(task)" />
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
    <TaskDetailModal :task="selectedTask" @close="closeTask" @approve="approveTask" />

  </div>
</template>