<script setup vapor>
import { ref } from 'vue'
import Icons from './Icons.vue';

const props = defineProps(['addTask'])
const type = ref('regular')
const subTasks = ref([''])

</script>

<template>
    <div class="bg-white h-200 w-150 bg-white rounded-xl shadow-2xl px-10 relative flex flex-col justify-start 
            items-center overflow-y-auto py-2">
        <div class="flex flex-col justify-center items-start">
            <div class="text-3xl text-center py-5 border-b-2 w-120">
                Assign a Task
            </div>

            <form action="" class="py-5 flex flex-col justify-start">
                <label for="title" class="">Title</label>
                <input id="title" name="title" type="text"
                    class="border border-2 border-gray-400 h-10 w-120 rounded-md mb-5 px-2" required>

                <label for="desc">Description</label>
                <textarea id="desc" name="desc" type="text"
                    class="max-h-50 resize-none border border-2 border-gray-400 rounded-md p-2" rows="5"
                    maxlength="500" />
                <span class="mt-1 mb-5 text-xs text-red-600 italic">(Max 500 characters)</span>

                <label>Sub-tasks</label>
                <div class="flex flex-col mb-5 max-h-50 overflow-y-auto mask-y-from-92% mask-y-to-100%">

                    <div class="flex flex-row items-center gap-3 py-3" v-for="(item, index) in subTasks" :key="item">
                        <span class="text-gray-500">{{ index + 1 }}</span>
                        <textarea v-model="item" :name="'subtask' + index" type="text"
                            class="max-h-30 w-full mr-5 resize-none border border-2 border-gray-400 rounded-md p-2" rows="1"
                            maxlength="200" />
                    </div>

                    <span class="mt-1 text-xs text-red-600 italic">(Max 200 characters)</span>

                    <button @click="subTasks.push('')" class="flex flex-col flex-shrink-0 justify-center items-center 
                        self-center bg-green-950 rounded-full h-10 w-10 text-white mb-5">
                        <Icons :icon="'add'" />
                    </button>
                </div>

                <div class="flex flex-row justify-between mb-5">
                    <div class="flex flex-col ">
                        <label for="date">Date</label>
                        <input type="date" name="date" id="date"
                            class="border border-2 border-gray-400 rounded-md px-2 py-[10px]">
                    </div>

                    <div class="flex flex-col">
                        <label for="date">Type</label>
                        <select type="date" name="date" id="date"
                            class="border border-2 border-gray-400 rounded-md pl-2 pr-[7rem] py-[12px]">
                            <option v-for="opts in ['Regular', 'Insertion']" :key="opts" :value="opts.toLowerCase()">
                                {{ opts }} Task
                            </option>
                        </select>
                    </div>
                </div>

                <label for="date">Assignee</label>
                <select type="date" name="date" id="date"
                    class="border border-2 border-gray-400 rounded-md pl-2 py-3 mb-5">
                    <option v-for="opts in ['Nheron Cedro', 'June Luis Barneso']" :key="opts"
                        :value="opts.toLowerCase()">
                        {{ opts }}
                    </option>
                </select>

                <div class="flex flex-row-reverse justify-center gap-2 text-red-600 items-center mb-3">
                    <label for="urgent">Mark as Urgent</label>
                    <input type="checkbox" name="urgent" id="urgent" class="h-5 w-5">
                </div>

                <div class="flex flex-row justify-between">

                    <button class="h-12 w-50 border border-2 rounded-md border-green-900 text-green cursor-pointer">Bulk
                        Submission</button>

                    <button class="bg-green-950 rounded-md text-white h-12 w-50 cursor-pointer">Submit</button>

                </div>
            </form>
        </div>
    </div>
</template>