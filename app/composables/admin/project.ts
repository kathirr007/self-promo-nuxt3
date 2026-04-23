import { acceptHMRUpdate, defineStore } from 'pinia'
import slugify from 'slugify'

export const useAdminProjectStore = defineStore('adminProject', () => {
  const items = ref<any[]>([])
  const item = ref<Record<string, any>>({ storageLocation: null })
  const canUpdateProject = ref(false)

  async function fetchAdminProjects() {
    const projects = await $fetch<any[]>('/api/products/user-products')
    items.value = projects
    return items.value
  }

  async function fetchProjectById(projectId: string) {
    const project = await $fetch<any>(`/api/products/${projectId}`)
    item.value = project
    return item.value
  }

  async function createProject(projectData: Record<string, any>) {
    setProjectValue('title', projectData.title)
    await $fetch('/api/products/', { method: 'POST', body: projectData })
    await navigateTo('/admin/projects')
  }

  async function updateProject() {
    const project = item.value
    const data = new FormData()
    let uploadedFiles: string | null = null
    let deleteFiles = false

    if (project.images[0] !== undefined && typeof project.images[0].location === 'undefined') {
      for (let i = 0; i < project.images.length; i++) {
        data.append('images', project.images[i])
        uploadedFiles = JSON.stringify(project.uploadedFiles)
        deleteFiles = true
      }
    }
    else {
      uploadedFiles = JSON.stringify(project.images)
      data.append('images', uploadedFiles)
    }

    data.append('authorID', project.author)
    data.append('categoryID', project.category)
    data.append('createdAt', project.createdAt)
    data.append('description', project.description)
    data.append('promoVideoLink', project.promoVideoLink)
    data.append('productLink', project.productLink)
    data.append('requirements', JSON.stringify(project.requirements))
    data.append('status', project.status)
    data.append('subtitle', project.subtitle)
    data.append('title', project.title)
    data.append('storageLocation', project.storageLocation)
    data.append('storageLocationNew', project.storageLocationNew)
    data.append('updatedAt', project.updatedAt)
    data.append('wsl', JSON.stringify(project.wsl))

    const headers = {
      storagelocation: project.storageLocation,
      storagelocationnew: project.storageLocationNew,
      uploadedfiles: uploadedFiles,
      deletefiles: String(deleteFiles),
    }

    const updated = await $fetch<any>(`/api/products/${project._id}`, { method: 'PATCH', body: data, headers })
    item.value = updated
    return item.value
  }

  async function deleteProjectImage(params: { key: string, s3Key: string }) {
    await $fetch(`/api/products/ProdImage/${params.key}`, { method: 'DELETE', headers: { storagelocation: params.s3Key } })
    canUpdateProject.value = true
    return true
  }

  async function deleteProject(project: Record<string, any>) {
    const uploadedFiles = JSON.stringify(project.images)
    const headers = {
      storagelocation: project.storageLocation,
      storagelocationnew: project.storageLocationNew,
      uploadedfiles: uploadedFiles,
      deletefiles: 'true',
    }
    await $fetch(`/api/products/${project._id}`, { method: 'DELETE', headers })
    const projectIndex = items.value.findIndex(b => b._id === project._id)
    if (projectIndex !== -1)
      items.value.splice(projectIndex, 1)
    return true
  }

  function addLine(field: string) {
    item.value[field].push({ value: '' })
  }

  function removeLine(field: string, index: number) {
    item.value[field].splice(index, 1)
  }

  function removeProjectImage(field: string, index: number) {
    item.value[field].splice(index, 1)
  }

  function setLineValue(field: string, index: number, value: any) {
    item.value[field][index].value = value
    canUpdateProject.value = true
  }

  function setProjectValue(field: string, value: any) {
    if (field === 'title') {
      const storageLocationNew = `projects/${slugify(value, { replacement: '-', remove: undefined, lower: true })}`
      if (storageLocationNew !== item.value.storageLocation) {
        item.value.storageLocation = storageLocationNew
        item.value.storageLocationNew = storageLocationNew
      }
      canUpdateProject.value = !!(value && value.length >= 10)
    }
    else {
      canUpdateProject.value = true
    }
    item.value[field] = value
  }

  function updateUploadedFiles(value: any) {
    item.value.uploadedFiles = value
  }

  return {
    items,
    item,
    canUpdateProject,
    fetchAdminProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProjectImage,
    deleteProject,
    addLine,
    removeLine,
    removeProjectImage,
    setLineValue,
    setProjectValue,
    updateUploadedFiles,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAdminProjectStore, import.meta.hot))
