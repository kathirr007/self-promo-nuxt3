import { acceptHMRUpdate, defineStore } from 'pinia'

export const useCategoryStore = defineStore('category', () => {
  const items = ref<any[]>([])

  const hasCategories = computed(() => items.value.length > 0)

  async function fetchCategories() {
    if (hasCategories.value)
      return
    const categories = await $fetch<any[]>('/api/categories')
    items.value = categories
    return items.value
  }

  return { items, hasCategories, fetchCategories }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCategoryStore, import.meta.hot))
