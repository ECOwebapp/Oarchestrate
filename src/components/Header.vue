<script setup>
import { computed } from 'vue'

const props = defineProps(['pageName']);

const header = {
    dashboard: "View summary of analytics and tasks",
    tasks: "Manage all regular tasks, including creating, approving, assigning, and deleting",
    design: "Review all designs, including submitting, commenting, and approving",
    organization: "View all members and their hierarchy within the organisation",
    analytics: "View detailed analysis of the tasks with different types of charts",
    profile: "View personal details, edit profile images, or add something about you"
}

const description = computed(() => {
    const key = String(props.pageName).toLowerCase();
    return header[key] || null;
});

</script>

<template>
    <div class="flex items-center justify-between px-10 h-20
            bg-green-900 bg-[url('/images/csu_admin_building.png')] bg-cover bg-center bg-blend-multiply">
        <div class="flex flex-col text-white max-w-[25rem] text-wrap">
            <p class="text-2xl font-bold">{{ pageName }} {{ pageName === 'Design' ? 'Review' : '' }}</p>
            <p class="text-xs italic">{{ description }}</p>
        </div>

        <a class="h-18 w-18 bg-[url('/images/csu_seal.png')] bg-contain bg-center bg-no-repeat"
            href="https://www.carsu.edu.ph" target="_blank" rel="noopener noreferrer" />
    </div>
</template>