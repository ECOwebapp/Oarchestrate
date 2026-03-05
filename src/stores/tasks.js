import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from '@/lib/supabaseClient'

export const taskStore = defineStore('tasks', () => {

    // 1. State: The unified data
    const tasks = ref([])
    const loading       = ref(true)
    const error         = ref(null)

    const fetchTasks = async () => {
        loading.value = true
        error.value   = null
        try {
            // Step 1: get task_approval rows where director not yet approved
            const { data: approvalRows, error: approvalErr } = await supabase
            .from('task_approval')
            .select('id, unit_head, director')
            .eq('director', false)
        
            if (approvalErr) throw approvalErr
            if (!approvalRows?.length) { tasks.value = []; return }
        
            // Step 2: get assignee positions to determine direct-to-director staff
            const { data: posRows, error: posErr } = await supabase
            .from('position')
            .select('user_id, pos_id')
        
            if (posErr) throw posErr
            const posMap = Object.fromEntries((posRows||[]).map(p => [p.user_id, p.pos_id]))
        
            // Only keep approvals where unit_head=true OR assignee is direct-to-director
            // We'll cross-reference after fetching tasks
            const approvalIds = approvalRows.map(a => a.id)
        
            // Step 3: fetch tasks matching those approval IDs
            const { data, error: taskErr } = await supabase
            .from('task')
            .select(`
                id, parent_id, assigner, assignee,
                task_profile ( title, description, urgent, task_type_ref:task_type(task_type) ),
                task_approval ( id, unit_head, director ),
                task_duration ( created, deadline ),
                task_output   ( link ),
                subtasks:task!parent_id ( id, task_profile(description) )
            `)
            .is('parent_id', null)
            .in('id', approvalIds)
        
            if (taskErr) throw taskErr
        
            // Step 4: build name map
            const uuids = [...new Set((data||[]).flatMap(t => [t.assigner, t.assignee]).filter(Boolean))]
            let nameMap = {}
            if (uuids.length) {
            const { data: profs } = await supabase
                .from('user_profile')
                .select('id, fname, lname')
                .in('id', uuids)
            nameMap = Object.fromEntries((profs||[]).map(p => [p.id, `${p.fname||''} ${p.lname||''}`.trim()]))
            }
        
            // Step 5: filter — unit head approved OR direct-to-director position
            tasks.value = (data||[])
            .filter(t => {
                const isDirect = DIRECT_TO_DIRECTOR_POSITIONS.includes(posMap[t.assignee])
                return isDirect || t.task_approval?.unit_head === true
            })
            .map(t => ({
                id:          t.id,
                title:       t.task_profile?.title       || 'Untitled',
                description: t.task_profile?.description || '',
                urgent:      !!t.task_profile?.urgent,
                type:        t.task_profile?.task_type_ref?.task_type?.toLowerCase() || 'regular',
                created:     t.task_duration?.created    || null,
                deadline:    t.task_duration?.deadline   || null,
                assignedBy:  nameMap[t.assigner]         || 'Unknown',
                assignedTo:  nameMap[t.assignee]         || 'Unknown',
                unitHeadOk:  !!t.task_approval?.unit_head,
                outputLink:  t.task_output?.link         || null,
                subtasks:    (t.subtasks||[]).map(s => s.task_profile?.description || ''),
            }))
        
        } catch(e) {
            error.value = e.message
            console.error('[Dashboard] fetch error:', e)
        } finally {
            loading.value = false
        }
    }
    
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
        loading,
        error, 
        fetchTasks,
        addTasks, 
        totalTasks,
        lastTask 
    }
})