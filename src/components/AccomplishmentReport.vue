<script setup>
import { computed } from 'vue'
import { taskStore } from '@/stores/tasks.js'

defineProps(['show'])
const emit = defineEmits(['close'])

const store = taskStore()

const samplePrograms = [
  {
    program: 'Green Campus Development Plan',
    tasks: [
      {
        taskName: 'Finalization of the highlights of the Green Campus Development Plan (first draft)',
        subtasks: [
          { name: 'Review of ECOSMART writeshop outputs',        assignedTo: ['Nheron', 'Jacky'], startDate: '01/20/2026', endDate: '02/05/2026', duration: 2, status: 'approved',         mov: { label: 'Output 1',          url: 'https://drive.google.com' }, remarks: '' },
          { name: 'Consolidation of the writeshop outputs',      assignedTo: ['June', 'Austin'],  startDate: '02/08/2026', endDate: '02/17/2026', duration: 2, status: 'approved',         mov: { label: 'Consolidated Doc',  url: 'https://drive.google.com' }, remarks: '' },
          { name: 'Formatting and Structuring of the Highlight', assignedTo: ['Jacky', 'Cyrel'],  startDate: '02/15/2026', endDate: '02/21/2026', duration: 3,  status: 'revision',         mov: null, remarks: '' },
          { name: 'Review and Editing',                          assignedTo: ['Cyrel', 'June'],   startDate: '02/20/2026', endDate: '02/26/2026', duration: 3,  status: 'pending_approval', mov: null, remarks: '' },
          { name: 'Finalization of First Draft Highlights',      assignedTo: ['Cyrel', 'Nheron'], startDate: '02/28/2026', endDate: '03/05/2026', duration: 3,   status: 'pending',          mov: null, remarks: '' },
        ],
      },
      {
        taskName: 'Development, Approval, and Dissemination of Policy Brief',
        subtasks: [
          { name: 'Draft Policy Brief',            assignedTo: ['Adam', 'Grace'],        startDate: '02/01/2026', endDate: '02/10/2026', duration: 5, status: 'revision',         mov: { label: 'Draft v1', url: 'https://drive.google.com' }, remarks: '' },
          { name: 'Internal Review and Revision',  assignedTo: ['Grace'],               startDate: '02/12/2026', endDate: '02/18/2026', duration: 3, status: 'pending_approval', mov: null, remarks: '' },
          { name: 'Finalization and Distribution', assignedTo: ['Adam', 'Kim', 'Grace'], startDate: '02/20/2026', endDate: '02/28/2026', duration: 4,  status: 'pending',          mov: null, remarks: '' },
        ],
      },
      {
        taskName: 'Conduct of Writeshop for the finalization of the Green Campus Development Plan',
        subtasks: [
          { name: 'Venue and logistics coordination', assignedTo: ['Nheron'],         startDate: '02/05/2026', endDate: '02/12/2026', duration: 4, status: 'approved',         mov: { label: 'Logistics Plan', url: 'https://drive.google.com' }, remarks: '' },
          { name: 'Facilitation of writeshop',       assignedTo: ['June', 'Jacky'],  startDate: '02/13/2026', endDate: '02/19/2026', duration: 4,  status: 'pending_approval', mov: null, remarks: '' },
          { name: 'Documentation of outputs',        assignedTo: ['Austin', 'Cyrel'], startDate: '02/20/2026', endDate: '02/25/2026', duration: 3,  status: 'pending',          mov: null, remarks: '' },
        ],
      },
    ],
  },
  {
    program: 'Smart Campus Development Plan',
    tasks: [
      {
        taskName: 'Finalization of the highlights of the Smart Campus Development Plan (first draft)',
        subtasks: [
          { name: 'Review of ECOSMART writeshop outputs',        assignedTo: ['Austin', 'June'], startDate: '01/20/2026', endDate: '02/05/2026', duration: 2, status: 'approved',         mov: { label: 'Output 1', url: 'https://drive.google.com' }, remarks: '' },
          { name: 'Consolidation of the writeshop outputs',      assignedTo: ['Austin', 'June'], startDate: '02/08/2026', endDate: '02/17/2026', duration: 2, status: 'approved',         mov: null, remarks: '' },
          { name: 'Formatting and Structuring of the Highlight', assignedTo: ['Austin', 'June'], startDate: '02/15/2026', endDate: '02/21/2026', duration: 3,  status: 'revision',         mov: null, remarks: '' },
          { name: 'Review and Editing',                          assignedTo: ['Austin', 'June'], startDate: '02/20/2026', endDate: '02/26/2026', duration: 3,  status: 'pending_approval', mov: null, remarks: '' },
          { name: 'Finalization of First Draft Highlights',      assignedTo: ['Austin', 'June'], startDate: '02/28/2026', endDate: '03/05/2026', duration: 3,   status: 'pending',          mov: null, remarks: '' },
        ],
      },
      {
        taskName: 'Development, Approval, and Dissemination of Policy Brief',
        subtasks: [
          { name: 'Draft Policy Brief',            assignedTo: ['Kim', 'Rex'],   startDate: '02/01/2026', endDate: '02/10/2026', duration: 8, status: 'approved',         mov: { label: 'Draft v1', url: 'https://drive.google.com' }, remarks: '' },
          { name: 'Internal Review and Revision',  assignedTo: ['Miller'],       startDate: '02/12/2026', endDate: '02/18/2026', duration: 6, status: 'pending_approval', mov: null, remarks: '' },
          { name: 'Finalization and Distribution', assignedTo: ['Kim', 'Miller'], startDate: '02/20/2026', endDate: '02/28/2026', duration: 8,  status: 'pending',          mov: null, remarks: '' },
        ],
      },
    ],
  },
]

// Flatten programs into groups with program metadata for easy rendering
const programs = computed(() => {
  let source = samplePrograms
  if (store.tasks && store.tasks.length > 0) {
    const parents  = store.tasks.filter(t => !t.parentId || t.parentId === 0)
    const children = store.tasks.filter(t =>  t.parentId && t.parentId !== 0)
    source = [{
      program: 'Tasks',
      tasks: parents.map(p => ({
        taskName: p.name,
        subtasks: children
          .filter(c => c.parentId === p.id)
          .map(c => {
            const start = c.startDate ? new Date(c.startDate) : null
            const end   = c.endDate   ? new Date(c.endDate)   : null
            const dur   = (start && end) ? Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))) : '—'
            return {
              name:       c.name,
              assignedTo: Array.isArray(c.assignee) ? c.assignee : (c.assignee ? [c.assignee] : ['—']),
              startDate:  start ? start.toLocaleDateString('en-PH') : '—',
              endDate:    end   ? end.toLocaleDateString('en-PH')   : '—',
              duration:   dur,
              status:     c.revision ? 'revision' : c.urgent ? 'pending_approval' : 'pending',
              mov:        (Array.isArray(c.movs) && c.movs.length > 0) ? c.movs[0] : null,
              remarks:    '',
            }
          }),
      })),
    }]
  }
  // Annotate each program with rowspan = total subtask rows across all its tasks
  return source.map(prog => ({
    program: prog.program,
    tasks:   prog.tasks,
    rowspan: prog.tasks.reduce((a, t) => a + Math.max(t.subtasks.length, 1), 0),
  }))
})

const statusLabel = (s) => { const map = { approved: 'Approved', pending_approval: 'For Approval', pending: 'Pending', revision: 'Revision' }; return map[s] !== undefined ? map[s] : s }
const statusClass  = (s) => { const map = { approved: 'bg-emerald-100 text-emerald-700 border-emerald-200', pending_approval: 'bg-yellow-100 text-yellow-700 border-yellow-200', pending: 'bg-gray-100 text-gray-500 border-gray-200', revision: 'bg-orange-100 text-orange-600 border-orange-200' }; return map[s] !== undefined ? map[s] : 'bg-gray-100 text-gray-400' }

const today = new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
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
        <div class="flex items-center gap-4 mb-5">
          <img src="/images/csu_seal.png" alt="" class="w-12 h-12 object-contain flex-shrink-0"
            onerror="this.style.display='none'" />
          <div>
            <p class="text-[10px] font-bold tracking-[0.15em] text-green-700 uppercase">Caraga State University</p>
            <h1 class="text-xl font-bold text-gray-900">Accomplishment Report</h1>
          </div>
        </div>
        <div class="flex gap-0 text-xs text-gray-600 border border-gray-200 rounded-lg overflow-hidden">
          <!-- Left column -->
          <div class="flex-1 divide-y divide-gray-200">
            <div class="flex items-center gap-3 px-4 py-2">
              <span class="w-20 font-semibold text-gray-400 uppercase tracking-wide text-[10px] flex-shrink-0">Name</span>
              <span class="flex-1 text-gray-700">&nbsp;</span>
            </div>
            <div class="flex items-center gap-3 px-4 py-2">
              <span class="w-20 font-semibold text-gray-400 uppercase tracking-wide text-[10px] flex-shrink-0">Office</span>
              <span class="flex-1 text-gray-700">&nbsp;</span>
            </div>
          </div>
          <!-- Vertical divider -->
          <div class="w-px bg-gray-200 flex-shrink-0"></div>
          <!-- Right column -->
          <div class="flex-1 divide-y divide-gray-200">
            <div class="flex items-center gap-3 px-4 py-2">
              <span class="w-20 font-semibold text-gray-400 uppercase tracking-wide text-[10px] flex-shrink-0">Position</span>
              <span class="flex-1 text-gray-700">&nbsp;</span>
            </div>
            <div class="flex items-center gap-3 px-4 py-2">
              <span class="w-20 font-semibold text-gray-400 uppercase tracking-wide text-[10px] flex-shrink-0">Date</span>
              <span class="flex-1 text-gray-700">{{ today }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Table ── -->
      <div class="overflow-auto flex-1">
        <table class="w-full text-xs border-collapse">
          <thead class="sticky top-0 z-10">
            <tr class="bg-green-900 text-white text-[11px] uppercase tracking-wide">
              <th class="px-3 py-3 font-semibold text-center w-28 border-r border-green-700">Project / Programs</th>
              <th class="px-3 py-3 font-semibold text-center w-8 border-r border-green-700">#</th>
              <th class="px-4 py-3 font-semibold text-center w-44 border-r border-green-700">Tasks</th>
              <th class="px-4 py-3 font-semibold text-center border-r border-green-700">Subtasks</th>
              <th class="px-3 py-3 font-semibold text-center w-28 border-r border-green-700">Assigned Personnel</th>
              <th class="px-3 py-3 font-semibold text-center w-24 border-r border-green-700">Start Date</th>
              <th class="px-3 py-3 font-semibold text-center w-24 border-r border-green-700">Due Date</th>
              <th class="px-3 py-3 font-semibold text-center w-16 border-r border-green-700">Duration</th>
              <th class="px-3 py-3 font-semibold text-center w-36 border-r border-green-700">MOVs</th>
              <th class="px-3 py-3 font-semibold text-center w-20">Remarks</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(prog, pi) in programs" :key="pi">
              <template v-for="(group, gi) in prog.tasks" :key="gi">

                <!-- Task has subtasks -->
                <template v-if="group.subtasks && group.subtasks.length > 0">
                  <tr v-for="(sub, si) in group.subtasks" :key="si"
                    :class="[
                      si === group.subtasks.length - 1 ? 'border-b-2 border-gray-300' : 'border-b border-gray-100',
                      'hover:bg-green-50/30 transition-colors bg-white'
                    ]">

                    <!-- Project/Programs — first task, first subtask only; spans entire program -->
                    <td v-if="gi === 0 && si === 0" :rowspan="prog.rowspan"
                      class="border-r-2 border-gray-300 border-b-2 align-middle text-center bg-green-900/5">
                      <div class="flex items-center justify-center h-full px-2 py-3">
                        <span class="font-bold text-green-900 text-[11px] tracking-wide leading-tight text-center"
                          style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap;">
                          {{ prog.program }}
                        </span>
                      </div>
                    </td>

                    <!-- # — first subtask only, rowspanned across task's subtasks -->
                    <td v-if="si === 0" :rowspan="group.subtasks.length"
                      class="px-3 py-2 text-center text-gray-400 font-semibold border-r border-gray-200 align-middle bg-gray-50">
                      {{ gi + 1 }}
                    </td>

                    <!-- Task name — first subtask only, rowspanned -->
                    <td v-if="si === 0" :rowspan="group.subtasks.length"
                      class="px-4 py-3 font-semibold text-gray-800 border-r border-gray-200 align-middle text-center leading-snug bg-green-50/20">
                      {{ group.taskName }}
                    </td>

                    <!-- Subtask name -->
                    <td class="px-4 py-2 text-center text-gray-600 border-r border-gray-200">{{ sub.name }}</td>

                    <!-- Assigned Personnel -->
                    <td class="px-3 py-2 text-center border-r border-gray-200">
                      <div class="flex flex-wrap justify-center gap-1">
                        <span v-for="person in sub.assignedTo" :key="person"
                          class="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-700 text-white leading-tight">
                          {{ person }}
                        </span>
                      </div>
                    </td>

                    <!-- Start Date -->
                    <td class="px-3 py-2 text-center text-gray-500 border-r border-gray-200 whitespace-nowrap">{{ sub.startDate }}</td>

                    <!-- Due Date -->
                    <td class="px-3 py-2 text-center text-gray-500 border-r border-gray-200 whitespace-nowrap">{{ sub.endDate }}</td>

                    <!-- Duration -->
                    <td class="px-3 py-2 text-center text-gray-600 border-r border-gray-200">{{ sub.duration }}</td>

                    <!-- MOVs -->
                    <td class="px-3 py-2 text-center border-r border-gray-200">
                      <a v-if="sub.mov" :href="sub.mov.url" target="_blank" rel="noopener"
                        class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 hover:text-green-900 transition-colors max-w-[120px] truncate">
                        <svg class="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                        {{ sub.mov.label }}
                      </a>
                      <span v-else class="text-gray-300">—</span>
                    </td>

                    <!-- Remarks -->
                    <td class="px-3 py-2 text-center"></td>
                  </tr>
                </template>

                <!-- Task has no subtasks — single row -->
                <tr v-else
                  :class="['border-b-2 border-gray-300 hover:bg-green-50/30 bg-white transition-colors']">
                  <td v-if="gi === 0" :rowspan="prog.rowspan"
                    class="border-r-2 border-gray-300 border-b-2 align-middle text-center bg-green-900/5">
                    <div class="flex items-center justify-center h-full px-2 py-3">
                      <span class="font-bold text-green-900 text-[11px] tracking-wide leading-tight text-center"
                        style="writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap;">
                        {{ prog.program }}
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-2 text-center text-gray-400 font-semibold border-r border-gray-200 bg-gray-50">{{ gi + 1 }}</td>
                  <td class="px-4 py-3 font-semibold text-center text-gray-800 border-r border-gray-200">{{ group.taskName }}</td>
                  <td class="px-4 py-2 text-center text-gray-400 italic border-r border-gray-200">No subtasks</td>
                  <td class="px-3 py-2 border-r border-gray-200"></td>
                  <td class="px-3 py-2 border-r border-gray-200"></td>
                  <td class="px-3 py-2 border-r border-gray-200"></td>
                  <td class="px-3 py-2 border-r border-gray-200"></td>
                  <td class="px-3 py-2 border-r border-gray-200"></td>
                  <td class="px-3 py-2"></td>
                </tr>

              </template>
            </template>

            <tr v-if="programs.length === 0">
              <td colspan="10" class="py-16 text-center text-gray-400 text-sm">No tasks to display</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Footer ── -->
      <div class="flex-shrink-0 border-t border-gray-100 px-10 py-5 flex justify-between items-end bg-white">
        <div class="text-center w-48">
          <div class="h-8 border-b border-gray-400 mb-1"></div>
          <p class="text-[11px] text-gray-500 font-medium">Prepared by</p>
          <p class="text-[10px] text-gray-400">Signature over printed name</p>
        </div>
        <div class="text-[10px] text-gray-400 text-center space-y-0.5">
          <p>Total tasks: <span class="font-semibold text-gray-600">{{ programs.reduce((a, p) => a + p.tasks.length, 0) }}</span></p>
          <p>Total subtasks: <span class="font-semibold text-green-600">{{ programs.reduce((a, p) => a + p.tasks.reduce((b, t) => b + t.subtasks.length, 0), 0) }}</span></p>
          <p>Approved: <span class="font-semibold text-emerald-600">{{ programs.reduce((a, p) => a + p.tasks.reduce((b, t) => b + t.subtasks.filter(s => s.status === 'approved').length, 0), 0) }}</span></p>
          <p>For Approval: <span class="font-semibold text-yellow-600">{{ programs.reduce((a, p) => a + p.tasks.reduce((b, t) => b + t.subtasks.filter(s => s.status === 'pending_approval').length, 0), 0) }}</span></p>
          <p>For Revision: <span class="font-semibold text-orange-500">{{ programs.reduce((a, p) => a + p.tasks.reduce((b, t) => b + t.subtasks.filter(s => s.status === 'revision').length, 0), 0) }}</span></p>
        </div>
        <div class="text-center w-48">
          <div class="h-8 border-b border-gray-400 mb-1"></div>
          <p class="text-[11px] text-gray-500 font-medium">Noted by</p>
          <p class="text-[10px] text-gray-400">Signature over printed name</p>
        </div>
      </div>

    </div>
  </div>
</template>

