<script setup>
import GridTasks from '@/components/GridTasks.vue';
import TableTasks from '@/components/TableTasks.vue';
import ChartTasks from '@/components/ChartTasks.vue';
import Icons from '@/components/Icons.vue';
import { ref } from 'vue'

const state = ref('Grid View')
const dropdown = {
    filter: ["Regular", "Insertion", "Urgent", "Revision", "Pending", "Ongoing", "Completed"],
    sort: ["Name", "Date Due", "Recently Assigned", "Recently Completed"]
}

const tasks = [
    {
        name: "Preparations for the upcoming State Opening of Parliament",
        description: "Her Royal Majesty the Queen will address Parliament next week. Ensure the preparations \
            are timely within the Westminster building.",
        assigner: "Austin Rey A. Manlangit",
        assignee: "June Luis S. Barneso",
        from: "2026-02-02",
        to: "2026-03-01",
        type: "Regular",
        revision: false,
        urgent: true,
        status: "Ongoing",
        modal: "View Details"
    },
    {
        name: "Fix Navbar Overflow",
        description: "Correct the w-screen issue causing horizontal scroll.",
        assigner: "Grace",
        assignee: "John Doe",
        from: "2026-02-20",
        to: "2026-03-01",
        type: "Insertion",
        revision: true,
        urgent: true,
        status: "Ongoing",
        modal: "View Details"
    },
    {
        name: "Vapor Component Migration",
        description: "Convert standard VNode components into pure Vapor Mode.",
        assigner: "Grace",
        assignee: "Jane Smith",
        from: "2026-02-22",
        to: "2026-03-05",
        type: "Regular",
        revision: false,
        urgent: false,
        status: "Pending",
        modal: "View Details"
    },
    {
        name: "SVG Icon Refactor",
        description: "Replace JamesCoyle icons with native SVG paths.",
        assigner: "Grace",
        assignee: "Dev Team",
        from: "2026-02-24",
        to: "2026-02-28",
        type: "Insertion",
        revision: true,
        urgent: true,
        status: "Ongoing",
        modal: "View Details"
    },
    {
        name: "Database Schema Update",
        description: "Add profile images and social media link fields.",
        assigner: "Admin",
        assignee: "Jane Smith",
        from: "2026-02-25",
        to: "2026-03-10",
        type: "Regular",
        revision: false,
        urgent: false,
        status: "Pending",
        modal: "View Details"
    },
    {
        name: "Analytics Dashboard",
        description: "Integrate Chart.js for completion rate visualization.",
        assigner: "Grace",
        assignee: "John Doe",
        from: "2026-02-21",
        to: "2026-03-15",
        type: "Regular",
        revision: true,
        urgent: false,
        status: "Ongoing",
        modal: "View Details"
    },
    {
        name: "Authentication Audit",
        description: "Review JWT and token refresh logic security.",
        assigner: "Admin",
        assignee: "Security Lead",
        from: "2026-02-23",
        to: "2026-03-02",
        type: "Insertion",
        revision: false,
        urgent: true,
        status: "Ongoing",
        modal: "View Details"
    },
    {
        name: "Tailwind Theme Config",
        description: "Define custom primary colors and spacing units.",
        assigner: "Grace",
        assignee: "UI Designer",
        from: "2026-02-25",
        to: "2026-03-12",
        type: "Regular",
        revision: false,
        urgent: false,
        status: "Completed",
        modal: "View Details"
    },
    {
        name: "API Documentation",
        description: "Update Swagger docs for new organization endpoints.",
        assigner: "Tech Lead",
        assignee: "Jane Smith",
        from: "2026-02-26",
        to: "2026-03-08",
        type: "Regular",
        revision: true,
        urgent: false,
        status: "Pending",
        modal: "View Details"
    },
    {
        name: "Unit Testing",
        description: "Increase test coverage for task service to 85%.",
        assigner: "Grace",
        assignee: "Dev Team",
        from: "2026-02-20",
        to: "2026-03-20",
        type: "Regular",
        revision: false,
        urgent: false,
        status: "Ongoing",
        modal: "View Details"
    },
    {
        name: "SEO Optimization",
        description: "Add meta tags and structured data for landing page.",
        assigner: "Marketing",
        assignee: "John Doe",
        from: "2026-02-24",
        to: "2026-03-05",
        type: "Regular",
        revision: false,
        urgent: false,
        status: "Pending",
        modal: "View Details"
    }
];

</script>

<template>
    <div class="flex flex-cols justify-between items-start px-10 my-5">
        <button
            class="flex flex-row justify-evenly items-center bg-green-950 text-white font-bold h-13 w-40 rounded-2xl">
            <Icons :icon="'add'" />
            Add Task
        </button>

        <form @submit.prevent="">
            <!-- Code for the search bar: https://tailwindcss.com/plus/ui-blocks/application-ui/forms/input-groups -->
            <div
                class="flex items-center rounded-2xl bg-white/5 pl-3 outline-2 -outline-offset-1 outline-gray-400 has-[input:focus-within]:outline-3 has-[input:focus-within]:-outline-offset-3 has-[input:focus-within]:outline-green-800">
                <input type="text" name="search" placeholder="Search by task name"
                    class="block min-w-0 w-100 h-13 grow py-1.5 pr-3 pl-1 text-base placeholder:text-gray-500 focus:outline-none sm:text-sm/6" />
                <div class="grid shrink-0 grid-cols-1 focus-within:relative pr-3">
                    <Icons :icon="'search'" class="" />
                </div>
            </div>
        </form>

        <!-- <div class="flex flex-row justify-between my-2">
            <div v-for="drops in ['Filter', 'Sort']" :key="drops.toLowerCase()" class="flex flex-col">
                <label :for="drops.toLowerCase()" class="mr-2 text-sm">{{ drops }}: </label>
                <select :name="drops.toLowerCase()" :id="drops.toLowerCase()" class="border-1 rounded-lg px-3 h-7">
                    <option v-if="drops === 'Filter'" selected disabled>--Not Selected--</option>
                    <option v-for="opts in dropdown[drops.toLowerCase()]" :key="opts" :value="opts.toLowerCase()">
                        {{ opts }}
                    </option>
                </select>
            </div>
        </div> -->
    </div>

    <div class="flex-1 overflow-auto bg-white mx-10 rounded-xl shadow-md">
        <GridTasks v-if="state === 'Grid View'" :tasks="tasks" />
        <TableTasks v-else-if="state === 'Table View'" :tasks="tasks" />
        <ChartTasks v-else-if="state === 'Chart View'" :tasks="tasks" />
    </div>

    <div class="flex flex-row justify-center items-center gap-5 my-3">
        <button v-for="btn in ['Grid View', 'Table View', 'Chart View']"
            @click="state = btn"
            class="flex flex-row justify-evenly items-center text-sm font-bold h-10 w-30 rounded-xl cursor-pointer"
            :class="state === btn ? 'bg-green-950 text-white' : 'outline-2 outline-green-950 text-green-950 bg-white hover:bg-green-950 hover:text-white'">
            {{ btn }}
        </button>
    </div>

</template>