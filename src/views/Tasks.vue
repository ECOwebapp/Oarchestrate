<script setup vapor>
import Icons from '@/components/Icons.vue';

</script>

<template>
    <div class="flex flex-row justify-between items-center">
        <button
            class="flex flex-row justify-evenly items-center bg-green-950 text-white font-bold h-13 w-40 rounded-2xl">
            <Icons :icon="'add'" />
            Add Task
        </button>

        <form @submit.prevent="" class="flex flex-row">
            <!-- Code for the search bar: https://tailwindcss.com/plus/ui-blocks/application-ui/forms/input-groups -->
            <div>
                <div
                    class="flex items-center rounded-2xl bg-white/5 pl-3 outline-2 -outline-offset-1 outline-gray-400 has-[input:focus-within]:outline-3 has-[input:focus-within]:-outline-offset-3 has-[input:focus-within]:outline-green-800">
                    <input type="text" name="search" placeholder="Search by task name"
                        class="block min-w-0 w-80 h-13 grow py-1.5 pr-3 pl-1 text-base placeholder:text-gray-500 focus:outline-none sm:text-sm/6" />
                    <div class="grid shrink-0 grid-cols-1 focus-within:relative pr-3">
                        <Icons :icon="'search'" class="" />
                    </div>
                </div>
            </div>
        </form>
    </div>

</template>