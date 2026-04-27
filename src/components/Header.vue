<script setup vapor>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useCounterStore } from "@/stores/counter";
import { storeToRefs } from "pinia";

const counterStore = useCounterStore();
const { mobileOpen } = storeToRefs(counterStore);

const route = useRoute();
const pageName = computed(() => route.name);

const header = {
    dashboard: "View summary of analytics and tasks",
    projects: "Manage all programs, projects, and activities (PPAs)",
    tasks: "Manage all tasks, including creating, approving, assigning, and deleting",
    subtasks: "Manage or view all children of a Task called subtasks",
    design: "Review all designs, including submitting, commenting, and approving",
    insertions: "Insertions are tasks that are not part of any planned tasks",
    organization:
        "View all members and their hierarchy within the organisation",
    analytics:
        "View detailed analysis of the tasks with different types of charts",
    profile:
        "View personal details, edit profile images, or add something about you",
};

const description = computed(() => {
    const key = String(pageName.value).toLowerCase();
    return header[key] || null;
});
</script>

<template>
    <div
        class="flex items-center justify-between xl:px-10 pr-10 pl-3 h-20 bg-green-900 bg-[url('/images/csu_admin_building.png')] bg-cover bg-center bg-blend-multiply"
    >
        <div
            class="flex flex-row items-center gap-5 text-white max-w-100 text-wrap"
        >
            <!-- ══ MOBILE: Hamburger ══ -->
            <button
                @click="mobileOpen = true"
                class="xl:hidden w-12 h-12 flex items-center justify-center text-white active:scale-95 transition-transform rounded-full hover:cursor-pointer hover:bg-white/7"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    class="w-7 h-7"
                >
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <div>
                <p class="text-2xl font-bold">
                    {{ pageName }} {{ pageName === "Design" ? "Review" : "" }}
                </p>
                <p class="text-xs italic">{{ description }}</p>
            </div>
        </div>

        <a
            class="h-18 w-18 bg-[url('/images/csu_seal.png')] bg-contain bg-center bg-no-repeat"
            href="https://www.carsu.edu.ph"
            target="_blank"
            rel="noopener noreferrer"
        />
    </div>
</template>
