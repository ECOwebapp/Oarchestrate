<script setup vapor>
import { GanttChart } from "jordium-gantt-vue3";
import "jordium-gantt-vue3/dist/assets/jordium-gantt-vue3.css";
import { computed } from "vue";

const props = defineProps(["items"]);

const getProgress = (item) => {
    const start = new Date(item.from || item.created_at).getTime();
    const end = new Date(item.to || item.deadline).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end - start;
    const elapsed = now - start;

    return Math.round((elapsed / total) * 100);
};

// Map store item shape → Jordium format
// store fields: item.from (created date), item.to (deadline),
//               item.name, item.type, item.urgent,
//               item.assignerName, item.assigneeName
const ganttTasks = computed(() =>
    props.items
        .filter((t) => (t.from || t.created_at) && (t.to || t.deadline)) // skip items with no dates
        .map((item, index) => ({
            id: item.id || index + 1,
            name: item.name || "Untitled",
            startDate: (item.from || item.created_at).split("T")[0], // 'YYYY-MM-DD'
            endDate: (item.to || item.deadline).split("T")[0], // 'YYYY-MM-DD'
            progress: getProgress(item),
            assigner:
                item.assignerName || item.assigner || item.director || "—",
            assignee: item.assigneeName || item.assignee || "—",
            type: item.type || "—",
            status: item.is_completed ? "Completed" : "Ongoing",
            barColor: item.urgent ? "#7f1d1d" : "#003300",
        })),
);

console.log(ganttTasks.value);

const formatKey = (key) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
</script>

<template>
    <div
        class="h-full border border-gray-200 rounded-xl overflow-hidden shadow-sm"
    >
        <div
            v-if="ganttTasks.length === 0"
            class="flex flex-col items-center justify-center h-full py-20 text-gray-400"
        >
            <svg
                class="w-10 h-10 mb-3 opacity-30"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
            </svg>
            <p class="text-sm font-semibold">No items with dates to display</p>
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
            theme="light"
        >
            <!-- Tooltip -->
            <template #taskbar-tooltip="{ item }">
                <div class="p-2 min-w-50 max-w-70">
                    <div
                        class="font-bold text-[13px] mb-2 pb-1.5 border-b border-b-white/30 text-white"
                    >
                        {{ item.name }}
                    </div>
                    <div v-for="(value, key) in item" :key="key">
                        <div
                            v-if="
                                [
                                    'startDate',
                                    'endDate',
                                    'assigner',
                                    'assignee',
                                    'type',
                                    'status',
                                ].includes(key)
                            "
                            class="flex flex-row justify-between items-center min-h-5.5 gap-4"
                        >
                            <span
                                class="opacity-80 min-w-20 text-white text-[10px] font-bold"
                            >
                                {{ formatKey(key) }}:
                            </span>
                            <span
                                class="text-right text-white text-[11px] truncate"
                            >
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
