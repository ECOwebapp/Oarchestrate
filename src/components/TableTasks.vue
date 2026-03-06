<script setup>
import { useAuthStore } from '@/stores/useAuthStore';

const user_id = useAuthStore().userID
const tableHeaders = [
    "Name",
    "Description",
    "Assigner",
    "Assignee",
    "From",
    "To",
    "Type",
    "Revision",
    "Urgent",
    "Status",
    "Modal"
]

const prop = defineProps(['tasks'])

</script>

<template>
    <div class="rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200 bg-white text-sm border-collapse border border-gray-500">
            <thead class="bg-white-50">
                <tr>
                    <th v-for="header in tableHeaders" :key="header"
                        class="sticky top-0 z-10 px-4 py-2 font-medium border border-gray-500 bg-green-950 text-white text-center">
                        {{
                            header
                        }}</th>
                </tr>
            </thead>
            <tbody class="overflow-auto border border-collapse border-gray-500">
                <tr v-for="task in tasks" :key="task.name">
                    <template v-for="(value, key) in task" :key="key">
                        <td v-if="!['id', 'parentId', 'status', 'modal', 'outputLink'].includes(key)" class="border border-gray-500 p-2"
                            :class="key === 'name' ? 'font-bold' : ''">
                            {{ value }}
                        </td>
                        <td v-else-if="key === 'status'" class="border border-gray-500 p-2">
                            {{ task.assigner === user_id && task.assignee === user_id ? 'ongoing' : value }}
                        </td>
                    </template>

                    <td class="border border-gray-500 p-2 text-center">
                        <button @click="" class="bg-green-950 rounded-xl h-8 w-20 text-white font-bold cursor-pointer">
                            View
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>