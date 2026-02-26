<script setup vapor>
import GridTasks from '@/components/GridTasks.vue';
import Icons from '@/components/Icons.vue';

const dropdown = {
    filter: ["Regular", "Insertion", "Urgent", "Revision", "Pending", "Ongoing", "Completed"],
    sort: ["Name", "Date Due", "Recently Assigned", "Recently Completed"]
}

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

    <div class="flex-1 overflow-y-auto bg-white mx-10 py-5 rounded-xl shadow-md">
        <GridTasks />
    </div>

    <div class="flex flex-row justify-center items-center gap-5 my-3">
        <button v-for="btn in ['Grid View', 'Table View', 'Chart View']"
            class="flex flex-row justify-evenly items-center text-sm font-bold h-10 w-30 rounded-xl"
            :class="btn === 'Grid View' ? 'bg-green-950 text-white' : 'outline-2 outline-green-950 text-green-950 bg-white hover:bg-green-950 hover:text-white'">
            {{ btn }}
        </button>
    </div>

</template>