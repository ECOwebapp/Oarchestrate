<script setup vapor>
import { ref, computed, onMounted } from 'vue'
import Icons from './Icons.vue';
import { taskStore } from '@/stores/tasks.js'
import { useMemberStore } from '@/stores/member';
import { useAuthStore } from '@/stores/useAuthStore';

const addTask = taskStore().addTasks
const members = useMemberStore()
const userID = useAuthStore().userID
const props = defineProps(['addTask'])

console.log('User ID: ', userID)

const subTasks = ref([{ text: '' }])
const newTask = ref({
    name: '',
    description: '',
    endDate: null,
    assigner: userID,
    assignee: null,
    type: NaN,
    urgent: false,
    design: false,
})

const assignedMember = computed(() => {
    const subordinates = [2, 3, 4, 5]

    if (newTask.value.type !== 1) return members.members
    
    return members.members.filter(m => subordinates.includes(m.pos_id))
})

const submitForm = async () => {
    // 1. Filter out empty sub-tasks early
    const validSubTasks = subTasks.value
        .filter(st => st.text.trim() !== '')
        .map(st => ({ description: st.text })); // Match your schema's 'title' column

    const mainTaskData = {
        mainTask: { ...newTask.value },
        subTasks: validSubTasks // Pass the sub-tasks along in one object
    };

    try {
        // 2. Call the store action (we'll update this next)
        await addTask(mainTaskData);

        // 3. Reset UI only after success
        resetForm();
    } catch (error) {
        console.error("Failed to save:", error);
    }
}

const resetForm = () => {
    newTask.value = { 
        name: '', description: '', endDate: null, assignee: null, type: NaN, urgent: false, design: false 
    };
    subTasks.value = [''];
}

const addSubTask = () => {
  subTasks.value.push({ text: '' })
}

</script>

<template>
    <div class="bg-white h-200 w-150 bg-white rounded-xl shadow-2xl px-10 relative flex flex-col justify-start 
            items-center overflow-y-auto py-2">
        <div class="flex flex-col justify-center items-start">
            <div class="text-3xl text-center py-5 border-b-2 w-120">
                Assign a Task
            </div>

            <form @submit.prevent="submitForm" class="py-5 flex flex-col justify-start">
                <label for="title" class="">Title</label>
                <input v-model="newTask.name" id="title" name="title" type="text"
                    class="border border-2 border-gray-400 h-10 w-120 rounded-md px-2" 
                    placeholder="This is your title..." maxlength="100" required>
                    <span class="mt-1 mb-5 text-xs text-red-600 italic">(Max 100 characters)</span>

                <label for="desc">Description</label>
                <textarea v-model="newTask.description" id="desc" name="desc" type="text"
                    class="max-h-50 resize-none border border-2 border-gray-400 rounded-md p-2" rows="5"
                    maxlength="500" placeholder="This is your task description..." required />
                    <span class="mt-1 mb-5 text-xs text-red-600 italic">(Max 500 characters)</span>

                <label>Sub-tasks</label>
                <div class="flex flex-col mb-5 max-h-50 overflow-y-auto mask-y-from-92% mask-y-to-100%">

                    <div class="flex flex-row items-center gap-3 py-3" v-for="(item, index) in subTasks" :key="index">
                        <span class="text-gray-500">{{ index + 1 }}</span>
                        <textarea v-model="item.text" :name="'subtask' + index" type="text"
                            class="max-h-30 w-full mr-5 resize-none border border-2 border-gray-400 rounded-md p-2" rows="1"
                            maxlength="200" placeholder="This is your subtask..." />
                    </div>

                    <span class="mt-1 text-xs text-red-600 italic">(Max 200 characters)</span>

                    <button type="button" @click="addSubTask" class="flex flex-col flex-shrink-0 justify-center items-center 
                        self-center bg-green-950 rounded-full h-10 w-10 text-white mb-5">
                        <Icons :icon="'add'" />
                    </button>
                </div>

                <div class="flex flex-row justify-between mb-5">
                    <div class="flex flex-col ">
                        <label for="date">Date</label>
                        <input v-model="newTask.endDate" type="date" name="date" id="date" required
                            class="border border-2 border-gray-400 rounded-md px-2 py-[10px]">
                    </div>

                    <div class="flex flex-col">
                        <label for="type">Type</label>
                        <select v-model="newTask.type" type="text" name="type" id="type" required
                            class="border border-2 border-gray-400 rounded-md pl-2 pr-[7rem] py-[12px] text-black">
                            <option value="" selected disabled hidden>--Select Type--</option>
                            <option v-for="(opts, index) in ['Regular', 'Insertion']" :key="opts" :value="index+1">
                                {{ opts }} Task
                            </option>
                        </select>
                    </div>
                </div>

                <label for="assignee">Assignee</label>
                <select v-model="newTask.assignee" type="text" name="assignee" id="assignee"
                    class="border border-2 border-gray-400 rounded-md pl-2 py-3 mb-5" required>
                    <option value="" selected disabled hidden>--Select Subordinate--</option>
                    <option v-for="opts in assignedMember" :key="opts"
                        :value="opts.id">
                        {{ opts.fname }} {{ opts.middle_initial }} {{ opts.lname }}
                    </option>
                </select>

                <div class="flex flex-row-reverse justify-center gap-2 text-red-600 items-center mb-3">
                    <label for="urgent">Mark as Urgent</label>
                    <input v-model="newTask.urgent" type="checkbox" name="urgent" id="urgent" class="h-5 w-5">
                </div>

                <div class="flex flex-row justify-between">

                    <button class="h-12 w-50 border border-2 rounded-md border-green-900 text-green cursor-pointer">Bulk
                        Submission</button>

                    <button type="submit" class="bg-green-950 rounded-md text-white h-12 w-50 cursor-pointer">Submit</button>

                </div>
            </form>
        </div>
    </div>
</template>