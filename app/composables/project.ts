import { acceptHMRUpdate, defineStore } from 'pinia'

export const useProjectStore = defineStore('project', () => {
  const items = ref<any[]>([])
  const item = ref<Record<string, any>>({})

  async function fetchProjects() {
    const projects = await $fetch<any[]>('/api/projects')
    items.value = projects
    return items.value
  }

  async function fetchProjectBySlug(projectSlug: string) {
    const project = await $fetch<any>(`/api/projects/slug/${projectSlug}`)
    item.value = project
    return item.value
  }

  return { items, item, fetchProjects, fetchProjectBySlug }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useProjectStore, import.meta.hot))
