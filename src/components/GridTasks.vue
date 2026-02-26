<script setup vapor>
import TaskCard from './TaskCard.vue';

const props = defineProps(['tasks'])

const getProgress = (task) => {
    const start = new Date(task.dateAssigned).getTime()
    const end = new Date(task.deadline).getTime()
    const now = new Date().getTime()

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end - start
    const elapsed = now - start

    return Math.round((elapsed / total) * 100)
}

const getDue = (task) => {
    const today = new Date();
    const target = new Date(task.deadline);

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
    <div
        class="h-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 justify-items-center px-10 py-7 gap-10 overflow-y-auto">
        <TaskCard v-for="(task, index) in tasks" :key="task" :name="task.name" :description="task.description"
            :urgent="task.urgent" :progress="getProgress(task)" :due="getDue(task)" :style="{ order: index + 1 }" />
    </div>
</template>