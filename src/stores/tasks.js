import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const taskStore = defineStore('tasks', () => {

    // 1. State: The unified data
    const tasks = ref([])
    
    const addTasks = (newTask) => {
        tasks.value.push({
            id: 0,
            parentId: 0,
            name: '',
            description: '',
            startDate: Date.now(),
            endDate: '',
            assigner: '',
            assignee: '',
            type: '',
            urgent: false,
            revision: false,
            design: false,
            
            ...newTask
        })
    }
    // 3. Getters: Like computed properties
    const totalTasks = computed(() => tasks.value.length)
    const lastTask = computed(() => tasks.value[tasks.value.length - 1]);
    
    return { 
        tasks, 
        addTasks, 
        totalTasks,
        lastTask 
    }
})