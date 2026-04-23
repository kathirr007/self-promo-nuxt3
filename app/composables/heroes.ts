import { acceptHMRUpdate, defineStore } from 'pinia'

export const useHeroesStore = defineStore('heroes', () => {
  const projectHero = ref<Record<string, any>>({})

  async function createHero(projectHeroData: Record<string, any>) {
    const hero = await $fetch<any>('/api/project-heroes', { method: 'POST', body: projectHeroData })
    projectHero.value = hero
    return projectHero.value
  }

  async function fetchHero() {
    const data = await $fetch<any>('/api/project-heroes')
    projectHero.value = data.projectHero
    return projectHero.value
  }

  return { projectHero, createHero, fetchHero }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useHeroesStore, import.meta.hot))
