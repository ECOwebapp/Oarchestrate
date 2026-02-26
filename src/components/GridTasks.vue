<script setup vapor>
import TaskCard from './TaskCard.vue';

const tasks = [
    { name: "Perparations for the upcoming State Opening of Parliament", description: "Preperations are required for the upcoming State Opening.", dateAssigned: "2026-02-02", deadline: "2026-02-24", urgent: true },
    { name: "Fix Navbar Overflow", description: "Correct the w-screen issue causing horizontal scroll on mobile devices.", dateAssigned: "2026-02-20", deadline: "2026-03-01", urgent: true },
    { name: "Vapor Component Migration", description: "Convert standard VNode components into pure Vapor Mode components for performance.", dateAssigned: "2026-02-22", deadline: "2026-03-05", urgent: false },
    { name: "SVG Icon Refactor", description: "Remove the @jamescoyle/vue-icon dependency and use native SVG paths.", dateAssigned: "2026-02-24", deadline: "2026-02-28", urgent: true },
    { name: "Database Schema Update", description: "Add new fields for user profile images and social media links.", dateAssigned: "2026-02-25", deadline: "2026-03-10", urgent: false },
    { name: "Analytics Dashboard", description: "Implement Chart.js to visualize task completion rates over time.", dateAssigned: "2026-02-21", deadline: "2026-03-15", urgent: false },
    { name: "Authentication Audit", description: "Review JWT implementation and ensure token refresh logic is secure.", dateAssigned: "2026-02-23", deadline: "2026-03-02", urgent: true },
    { name: "Tailwind Theme Config", description: "Define custom primary colors and spacing units in tailwind.config.js.", dateAssigned: "2026-02-25", deadline: "2026-03-12", urgent: false },
    { name: "API Documentation", description: "Update Swagger/OpenAPI docs to include the new organization endpoints.", dateAssigned: "2026-02-26", deadline: "2026-03-08", urgent: false },
    { name: "Unit Testing", description: "Increase test coverage for the task management service to 85%.", dateAssigned: "2026-02-20", deadline: "2026-03-20", urgent: false },
    { name: "SEO Optimization", description: "Add meta tags and structured data for the main landing page.", dateAssigned: "2026-02-24", deadline: "2026-03-05", urgent: false },
    { name: "SEO Optimization", description: "Add meta tags and structured data for the main landing page.", dateAssigned: "2026-02-24", deadline: "2026-03-05", urgent: false },
    { name: "SEO Optimization", description: "Add meta tags and structured data for the main landing page.", dateAssigned: "2026-02-24", deadline: "2026-03-05", urgent: false }
];

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
        class="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center px-10 py-2 gap-10 overflow-y-auto">
        <TaskCard v-for="(task, index) in tasks" :key="task" :name="task.name" :description="task.description"
            :urgent="task.urgent" :progress="getProgress(task)" :due="getDue(task)" :style="{ order: index + 1 }" />
    </div>
</template>