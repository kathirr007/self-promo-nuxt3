import { acceptHMRUpdate, defineStore } from 'pinia'

export const useExperiencesStore = defineStore('experiences', () => {
  const items = ref({ all: [] as any[], featured: [] as any[], drafts: [] as any[], published: [] as any[] })
  const item = ref<Record<string, any>>({})
  const pagination = ref({ count: 0, pageCount: 0, pageSize: 5, pageNum: 1 })

  async function fetchExperiences(filter?: Record<string, any>) {
    const url = applyParamsToUrl('/api/experiences', filter)
    const data = await $fetch<any>(url)
    const { experiences, count, pageCount } = data
    items.value.all = experiences
    pagination.value.count = count
    pagination.value.pageCount = pageCount
    return items.value.all
  }

  async function fetchFeaturedExperiences(filter?: Record<string, any>) {
    const url = applyParamsToUrl('/api/experiences', filter)
    const data = await $fetch<any>(url)
    items.value.featured = data.experiences
    return items.value.featured
  }

  async function fetchExperienceBySlug(slug: string) {
    const experience = await $fetch<any>(`/api/experiences/s/${slug}`)
    item.value = experience
    return item.value
  }

  async function fetchExperienceById(id: string) {
    const experience = await $fetch<any>(`/api/experiences/${id}`)
    item.value = experience
    return item.value
  }

  function setPage(currentPage: number) {
    pagination.value.pageNum = currentPage
  }

  return { items, item, pagination, fetchExperiences, fetchFeaturedExperiences, fetchExperienceBySlug, fetchExperienceById, setPage }
})

function applyParamsToUrl(url: string, params?: Record<string, any>) {
  if (!params)
    return url
  const query = new URLSearchParams(params).toString()
  return query ? `${url}?${query}` : url
}

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useExperiencesStore, import.meta.hot))
