<script setup>
import { computed, ref } from 'vue'
import { GanttChart, TaskListColumn } from 'jordium-gantt-vue3'
import 'jordium-gantt-vue3/dist/assets/jordium-gantt-vue3.css'

const props = defineProps(['tasks'])

// The Data Logic: Mapping your table tasks to Jordium format
const ganttTasks = computed(() => {
    return props.tasks.map((task, index) => ({
        id: index + 1,               // Mandatory: Unique ID
        name: task.name,             // Mandatory: Task Title
        startDate: task.from,        // Format: 'YYYY-MM-DD'
        endDate: task.to,            // Format: 'YYYY-MM-DD'
        progress: task.status === 'Completed' ? 100 : 50,
        assignee: task.assignee,     // Custom field for the sidebar
        color: task.urgent ? '#dc2626' : '#052e16' // Urgent = Red, Else = Green
    }))
})
</script>

<template>
    <div class="h-[500px] border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <GanttChart :tasks="ganttTasks" :show-today-button="false" :show-expand-buttons="false"
            :show-fullscreen-button="false" enable-search task-list-column-render-mode="declarative" height="100%">
            <TaskListColumn prop="name" label="Task Name" width="1000" />

            <template #task-list-column-days="{ task }">
                <span class="text-[10px] font-bold text-gray-500">
                    {{ getDaysLeft(task.endDate) }}
                </span>
            </template>
        </GanttChart>
    </div>
</template>