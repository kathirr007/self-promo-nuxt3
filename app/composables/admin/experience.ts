  async function updateExperience(id: string, data: Record<string, any>) {
    isSaving.value = true
    try {
      const experience = await $fetch<any>(`/api/experiences/${id}`, { method: 'PATCH', body: data })
      item.value = experience
      push.success({
        title: 'Experience Updated',
        message: `Experience "${data.title || data.position}" has been updated successfully.`,
        duration: 4000,
      })
      return experience
    }
    catch (error: any) {
      const message = error?.data?.message ?? 'Failed to update experience. Please try again.'
      push.error({
        title: 'Update Failed',
        message,
        duration: 5000,
      })
      throw new Error(message)
    }
    finally {
      isSaving.value = false
    }
  }

  async function updatePublishedExperience(id: string, data: Record<string, any>) {
    try {
      const experience = await $fetch<any>(`/api/experiences/${id}`, { method: 'PATCH', body: data })
      const index = items.value.published.findIndex(b => b._id === id)
      if (index !== -1)
        items.value.published[index] = experience
      
      push.success({
        title: 'Experience Published',
        message: `Experience "${data.title || data.position}" has been updated and published successfully.`,
        duration: 4000,
      })
      return experience
    }
    catch (error: any) {
      const message = error?.data?.message ?? 'Failed to publish experience. Please try again.'
      push.error({
        title: 'Publish Failed',
        message,
        duration: 5000,
      })
      throw new Error(message)
    }
  }

  async function deleteExperience(experience: Record<string, any>) {
    try {
      const resource = experience.status === 'active' ? 'drafts' : 'published'
      await $fetch(`/api/experiences/${experience._id}`, { method: 'DELETE' })
      const experienceIndex = items.value[resource].findIndex(b => b._id === experience._id)
      if (experienceIndex !== -1)
        items.value[resource].splice(experienceIndex, 1)
      
      push.success({
        title: 'Experience Deleted',
        message: `Experience "${experience.title || experience.position}" has been deleted successfully.`,
        duration: 4000,
      })
      return true
    }
    catch (error: any) {
      const message = error?.data?.message ?? 'Failed to delete experience. Please try again.'
      push.error({
        title: 'Delete Failed',
        message,
        duration: 5000,
      })
      throw new Error(message)
    }
  }