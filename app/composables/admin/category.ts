import { acceptHMRUpdate, defineStore } from 'pinia'

export const useAdminCategoryStore = defineStore('adminCategory', () => {
  const items = ref<any[]>([])
  const item = ref<Record<string, any>>({})
  const canUpdateCategory = ref(false)

  async function fetchAdminCategories() {
    const categories = await $fetch<any[]>('/api/categories')
    items.value = categories
    return items.value
  }

  async function fetchCategoryById(categoryId: string) {
    const category = await $fetch<any>(`/api/categories/${categoryId}`)
    item.value = category
    return item.value
  }

  async function createCategory(categoryData: Record<string, any>) {
    await $fetch('/api/categories/', { method: 'POST', body: categoryData })
    await navigateTo('/admin/categories')
  }

  async function createCategory2(categoryData: Record<string, any>) {
    const category = await $fetch<any>('/api/categories/', { method: 'POST', body: categoryData })
    items.value.push(category)
  }

  async function updateCategory(category: Record<string, any>) {
    const updated = await $fetch<any>(`/api/categories/${category._id}`, { method: 'PATCH', body: category })
    const categoryIndex = items.value.findIndex(b => b._id === updated._id)
    item.value = updated
    if (categoryIndex !== -1) items.value[categoryIndex] = updated
  }

  async function deleteCategory(category: Record<string, any>) {
    await $fetch(`/api/categories/${category._id}`, { method: 'DELETE' })
    const categoryIndex = items.value.findIndex(b => b._id === category._id)
    if (categoryIndex !== -1) items.value.splice(categoryIndex, 1)
    return true
  }

  function addLine(field: string) {
    item.value[field].push({ value: '' })
  }

  function removeLine(field: string, index: number) {
    item.value[field].splice(index, 1)
  }

  function setLineValue(field: string, index: number, value: any) {
    item.value[field][index].value = value
  }

  function setProjectValue(field: string, value: any) {
    item.value[field] = value
  }

  return {
    items, item, canUpdateCategory,
    fetchAdminCategories, fetchCategoryById, createCategory, createCategory2,
    updateCategory, deleteCategory, addLine, removeLine, setLineValue, setProjectValue,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAdminCategoryStore, import.meta.hot))
