<script setup>
import { computed, ref } from 'vue'
import { GanttChart, TaskListColumn } from 'jordium-gantt-vue3'
import 'jordium-gantt-vue3/dist/assets/jordium-gantt-vue3.css'
const props = defineProps(['tasks'])

const getProgress = (task) => {
    const start = new Date(task.from).getTime()
    const end = new Date(task.to).getTime()
    const now = new Date().getTime()

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end - start
    const elapsed = now - start

    return Math.round((elapsed / total) * 100)
}

// The Data Logic: Mapping your table tasks to Jordium format
const ganttTasks = computed(() => {
    return props.tasks.map((task, index) => ({
        id: index + 1,               // Mandatory: Unique ID
        name: task.name,             // Mandatory: Task Title
        startDate: task.from,        // Format: 'YYYY-MM-DD'
        endDate: task.to,            // Format: 'YYYY-MM-DD'
        progress: getProgress(task),
        assigner: task.assigner,
        assignee: task.assignee,     // Custom field for the sidebar
        type: task.type,
        barColor: task.urgent ? 'var(--color-red-900)' : '#003300' // Urgent = Red, Else = Green
    }))
})

const formatKey = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1') // Adds space before capital letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalizes the first letter
  };
</script>

<template>
    <div class="h-full border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <GanttChart 
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
                <div class="color-white p-2 z-9999999999 min-w-50 max-w-70 ">
                    <div class="font-bold text-[13px] mb-[8px] pb-[6px] border-b border-b-gray-200 color-white">{{ task.name }}</div>
                    <div v-for="(value, key) in task" :key="key">
                        <div v-if="['startDate', 'endDate', 'assigner', 'assignee', 'type'].includes(key)"
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
.sample{
    background: rgba(0, 0, 0, 0.9)
}

</style>