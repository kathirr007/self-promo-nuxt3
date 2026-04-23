import { acceptHMRUpdate, defineStore } from 'pinia'

function separateExperiences(experiences: any[]) {
  const published: any[] = []
  const drafts: any[] = []
  experiences.forEach((experience) => {
    experience.status === 'active' ? drafts.push(experience) : published.push(experience)
  })
  return { published, drafts }
}

export const useAdminExperienceStore = defineStore('adminExperience', () => {
  const items = ref({ drafts: [] as any[], published: [] as any[] })
  const item = ref<Record<string, any>>({})
  const isSaving = ref(false)

  async function createExperience(experienceData: Record<string, any>) {
    return $fetch('/api/experiences', { method: 'POST', body: experienceData })
  }

  async function fetchExperienceById(experienceId: string) {
    const experience = await $fetch<any>(`/api/experiences/${experienceId}`)
    item.value = experience
  }

  async function fetchUserExperiences() {
    const experiences = await $fetch<any[]>('/api/experiences/me')
    const { published, drafts } = separateExperiences(experiences)
    items.value.drafts = drafts
    items.value.published = published
    return { published, drafts }
  }

  async function updateExperience(id: string, data: Record<string, any>) {
    isSaving.value = true
    try {
      const experience = await $fetch<any>(`/api/experiences/${id}`, { method: 'PATCH', body: data })
      item.value = experience
      return item.value
    }
    finally {
      isSaving.value = false
    }
  }

  async function updatePublishedExperience(id: string, data: Record<string, any>) {
    const experience = await $fetch<any>(`/api/experiences/${id}`, { method: 'PATCH', body: data })
    const index = items.value.published.findIndex(b => b._id === id)
    if (index !== -1)
      items.value.published[index] = experience
    return experience
  }

  async function deleteExperience(experience: Record<string, any>) {
    const resource = experience.status === 'active' ? 'drafts' : 'published'
    await $fetch(`/api/experiences/${experience._id}`, { method: 'DELETE' })
    const experienceIndex = items.value[resource].findIndex(b => b._id === experience._id)
    if (experienceIndex !== -1)
      items.value[resource].splice(experienceIndex, 1)
    return true
  }

  return { items, item, isSaving, createExperience, fetchExperienceById, fetchUserExperiences, updateExperience, updatePublishedExperience, deleteExperience }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAdminExperienceStore, import.meta.hot))
