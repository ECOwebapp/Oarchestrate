// stores/tasks.js
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/useAuthStore'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const taskStore = defineStore('tasks', () => {

    // 1. State: The unified data
    const tasks = ref([])
    const loading = ref(true)
    const error = ref(null)

    const user_id = useAuthStore().userID

    // Position IDs that go DIRECTLY to director (no unit head step needed)
    // Director, Assistant Director, Office Chief, Documentation Officer, Technical Admin/Clerical
    const DIRECT_TO_DIRECTOR_POSITIONS = [1, 2, 3, 9, 10]

    const fetchTasks = async () => {
        loading.value = true
        error.value = null
        try {

            const { data, error: taskErr } = await supabase
                .from('task')
                .select(`
                id, parent_id, assigner, assignee,
                task_profile ( title, description, revision, urgent, task_type_ref:task_type(task_type) ),
                task_approval ( id, unit_head, director ),
                task_duration ( created, deadline ),
                task_output   ( link ),
                subtasks:task!parent_id ( id, task_profile(description) )
            `)

            if (taskErr) throw taskErr

            // Step 5: filter — unit head approved OR direct-to-director position
            tasks.value = (data || [])
                .map(t => ({
                    id: t.id,
                    parentId: t.parent_id || null,
                    name: t.task_profile?.title || 'Untitled',
                    description: t.task_profile?.description || '',
                    assigner: t.assigner,
                    assignee: t.assignee,
                    startDate: t.task_duration?.created || null,
                    endDate: t.task_duration?.deadline || null,
                    type: t.task_profile?.task_type_ref?.task_type?.toLowerCase() || 'regular',
                    revision: t.task_profile?.revision,
                    urgent: t.task_profile?.urgent,
                    status: (() => {
                        const approval = t.task_approval;
                        const isInsertion = t.task_type === 'insertion';
                        
                        const isApproved = isInsertion 
                            ? approval?.director 
                            : (approval?.director && approval?.unit_head);
                    
                        if (isApproved) {
                            return 'completed';
                        } else if (approval?.director) {
                            return 'ongoing';
                        } else {
                            return 'pending';
                        }
                        
                    })(),
                    // unitHeadOk: !!t.task_approval?.unit_head,
                    outputLink: t.task_output?.link || null,
                }))

        } catch (e) {
            error.value = e.message
            console.error('[Dashboard] fetch error:', e)
        } finally {
            loading.value = false
        }
    }

    const addTasks = async (newTask) => {
        const { mainTask, subTasks } = newTask;

        const task_id = await insertTasks(mainTask)

        if (subTasks && subTasks.length > 0) {
            const subTaskPayloads = subTasks.map(st => ({
                ...st,
                parent_id: task_id // Link them!
            }));

            await insertTasks(subTaskPayloads);
        }
    }
    // 3. Getters: Like computed properties
    const totalTasks = computed(() => tasks.value.length)
    const lastTask = computed(() => tasks.value[tasks.value.length - 1]);

    return {
        tasks,
        loading,
        error,
        fetchTasks,
        addTasks,
        totalTasks,
        lastTask
    }
})