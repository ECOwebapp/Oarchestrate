<script setup>
import { computed } from 'vue'
import { GanttChart } from 'jordium-gantt-vue3'
import 'jordium-gantt-vue3/dist/assets/jordium-gantt-vue3.css'

const props = defineProps(['tasks'])

const getProgress = (task) => {
    const start = new Date(task.from).getTime()
    const end   = new Date(task.to).getTime()
    const now   = new Date().getTime()

    if (now < start) return 0
    if (now > end)   return 100

    const total   = end - start
    const elapsed = now - start

    return Math.round((elapsed / total) * 100)
}

// Map store task shape → Jordium format
// store fields: task.from (created date), task.to (deadline),
//               task.name, task.type, task.urgent,
//               task.assignerName, task.assigneeName
const ganttTasks = computed(() =>
    props.tasks
        .filter(t => t.from && t.to)   // skip tasks with no dates
        .map((task, index) => ({
            id:         task.id ?? index + 1,
            name:       task.name        || 'Untitled',
            startDate:  task.from,       // 'YYYY-MM-DD'
            endDate:    task.to,         // 'YYYY-MM-DD'
            progress:   getProgress(task),
            assigner:   task.assignerName || task.assigner || '—',
            assignee:   task.assigneeName || task.assignee || '—',
            type:       task.type        || '—',
            status:     task.director    ? 'Approved'
                      : task.unitHead    ? 'Pending Director'
                      :                   'Pending Unit Head',
            barColor:   task.urgent      ? '#7f1d1d' : '#003300',
        }))
)

const formatKey = (key) =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
</script>

<template>
    <div class="h-full border border-gray-200 rounded-xl overflow-hidden shadow-sm">

        <div v-if="ganttTasks.length === 0"
            class="flex flex-col items-center justify-center h-full py-20 text-gray-400">
            <svg class="w-10 h-10 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-sm font-semibold">No tasks with dates to display</p>
        </div>

        <GanttChart
            v-else
            :tasks="ganttTasks"
            :show-toolbar="false"
            :auto-sort-by-start-date="true"
            :allow-drag-and-resize="false"
            :enable-task-list-collapsible="false"
            :enable-task-bar-context-menu="false"
            :enable-task-list-context-menu="false"
            :show-actual-taskbar="true"
            :use-default-drawer="false"
            time-scale="day"
            view-mode="task"
            locale="en-US"
            task-list-column-render-mode="declarative"
            theme="light">

            <!-- Tooltip -->
            <template #taskbar-tooltip="{ task }">
                <div class="p-2 min-w-50 max-w-70">
                    <div class="font-bold text-[13px] mb-[8px] pb-[6px] border-b border-b-white/30 text-white">
                        {{ task.name }}
                    </div>
                    <div v-for="(value, key) in task" :key="key">
                        <div v-if="['startDate','endDate','assigner','assignee','type','status'].includes(key)"
                            class="flex flex-row justify-between items-center min-h-[22px] gap-4">
                            <span class="opacity-80 min-w-[80px] text-white text-[10px] font-bold">
                                {{ formatKey(key) }}:
                            </span>
                            <span class="text-right text-white text-[11px] truncate">
                                {{ value }}
                            </span>
                        </div>
                    </div>
                </div>
            </template>
        </GanttChart>
    </div>
</template>

<style>
.sample {
    background: rgba(0, 0, 0, 0.9);
}
</style>