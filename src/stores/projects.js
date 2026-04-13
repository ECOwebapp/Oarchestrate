import { defineStore } from "pinia";
import { apiFetch, session } from '@/lib/api'
import { ref } from 'vue'
import { useAuthStore } from "./useAuthStore";

export const useProjectStore = defineStore('ppa', () => {
    const projects = ref([])
    const loading = ref(false)
    const auth = useAuthStore()

    const fetchProjects = async () => {
        try {
            loading.value = true
            const response = await apiFetch('/ppa/fetch', { method: 'GET' })
            const result = await response.json()
            
            if(response.ok) {
                projects.value = result.projects
            } else {
                throw new Error(result.error)
            }

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
                const response = await apiFetch('/ppa/insert', {
                    method: 'POST',
                    body: JSON.stringify({
                        title: project.title,
                        description: project.description,
                        deadline: project.deadline
                    })
                })

                console.log(await response.json())
                return response.ok ? 'success' : 'failed'
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
            const response = await apiFetch('/ppa/insert', {
                method: 'POST',
                body: JSON.stringify(project)
            })

            return response.ok ? 'success' : 'failed'

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