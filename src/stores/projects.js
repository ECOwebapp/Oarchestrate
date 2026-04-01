import { defineStore } from "pinia";
import { supabase } from "@/lib/supabaseClient";
import { ref } from 'vue'
import { useAuthStore } from "./useAuthStore";

export const useProjectStore = defineStore('ppa', () => {
    const projects = ref([])
    const loading = ref(false)
    const auth = useAuthStore()

    const fetchProjects = async () => {
        try {
            loading.value = true
            const { data: projectRes, error: projectErr } = await supabase
                .from('ppa')
                .select(`
                    id, 
                    title, 
                    description, 
                    created_at, 
                    deadline, 
                    director_id, 
                    director:user_profile(
                        lname, fname, middle_initial
                    ),
                    is_completed
                `)

            if (projectErr) throw projectErr

            projects.value = (projectRes || []).map(p => ({
                ...p,
                director: p.director 
                    ? `${p.director.fname} 
                        ${p.director.middle_initial !== null ? p.director.middle_initial : ''} 
                        ${p.director.lname}` 
                    : null
            }))

        } catch (e) {
            console.log('Error fetching PPAs: ', e)
        } finally {
            loading.value = false
        }
    }

    const insertProjects = async (project) => {
        try {
            if (!auth.isDirector) {
                console.log('Not authorised!')
                return
            } else {
                loading.value = true
                const { data: projectRes, error: projectErr } = await supabase
                    .from('ppa')
                    .insert({
                        title: project.title,
                        description: project.description || null,
                        deadline: project.deadline,
                        director_id: auth.userID
                    })
                    .select()

                if (projectErr) throw projectErr

                return projectRes ? 'success' : 'failed'
            }
        } catch (e) {
            console.log('Error adding PPAs: ', e)
        } finally {
            loading.value = false
        }
    }

    const updateProjects = async (project) => {
        try {
            loading.value = true
            const { data: projectRes, error: projectErr } = await supabase
                .from('ppa')
                .update({ project })
                .eq('id', project.id)
                .select()

            if (projectErr) throw projectErr

            return projectRes ? 'success' : 'failed'

        } catch (e) {
            console.log('Error updating PPAs: ', e)
        } finally {
            loading.value = false
        }
    }

    const deleteProjects = async (id) => {
        try {
            loading.value = true
            const { error: projectErr, status: projectStatus } = await supabase
                .from('ppa')
                .delete()
                .in('id', id)

            if (projectErr) throw projectErr

            return projectStatus

        } catch (e) {
            console.log('Error adding PPAs: ', e)
        } finally {
            loading.value = false
        }
    }

    return { projects, loading, fetchProjects, insertProjects, updateProjects, deleteProjects }
})