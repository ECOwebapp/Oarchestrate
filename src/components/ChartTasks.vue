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
        description: task.description,
        startDate: task.from,        // Format: 'YYYY-MM-DD'
        endDate: task.to,            // Format: 'YYYY-MM-DD'
        progress: getProgress(task),
        assigner: task.assigner,
        assignee: task.assignee,     // Custom field for the sidebar
        color: task.urgent ? '#dc2626' : '#052e16' // Urgent = Red, Else = Green
    }))
})

const getDue = (task) => {
    const today = new Date();
    const target = new Date(task.to);

    // Set time to midnight for both to compare just the calendar days
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    // Difference in milliseconds
    const diffTime = target.getTime() - today.getTime();

    // Convert ms to days: ms / (1000ms * 60s * 60m * 24h)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};
</script>

<template>
    <div class="h-full border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <GanttChart 
            :tasks="ganttTasks" 
            :show-today-button="false"
            :use-default-drawer="false" 
            :show-toolbar="false"
            :row-height="500"
            :auto-sort-by-start-date="true"
            :allow-drag-and-resize="false"
            :show-taskbar-tab="false"
            :enable-task-list-collapsible="false"
            time-scale="day"
            view-mode="task" 
            locale="en-US"
            task-list-column-render-mode="declarative"
            theme="dark">
            
            <TaskListColumn v-for="task in ['name', 'description', 'assigner', 'assignee', 'startDate', 'endDate']" 
                :key="task" :prop="task" :label="task.toUpperCase()" width="30%" css-class="text-wrap"
                :align="task !== 'name' && task !=='description' ? 'center' : 'left'" />

            <template #task-list-column-days="{ task }">
                <span class="text-[10px] font-bold text-gray-500">
                    {{ getDue(task) }}
                </span>
            </template>
        </GanttChart>
    </div>
</template>