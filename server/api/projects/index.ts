// Nuxt 4 API routes use file-based routing with HTTP method handlers
// This replaces the Express router pattern

import { onlyAdmin } from '~~/server/controllers/auth'
import { createProject, getProjects } from '~~/server/controllers/project'
import ProjectModel from '~~/server/models/project'
import { generateUniqueSlug } from '~~/server/utils/slug'

// GET /api/projects
export default defineEventHandler(async (event) => {
  const method = event.method
  const url = getRouterParam(event, 'slug') || getRouterParam(event, 'id')

  switch (method) {
    case 'GET':
      // GET /api/projects
      return await getProjects()

    case 'POST':
      // POST /api/projects
      await onlyAdmin(event)
      return await createProject(event)

    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
      })
  }
})

// POST /api/projects/generate-slug
export const generateSlug = defineEventHandler(async (event) => {
  if (event.method !== 'POST') {
    throw createError({ statusCode: 405, message: 'Method not allowed' })
  }

  const { title, currentId } = await readBody(event)

  if (!title) {
    throw createError({ statusCode: 400, message: 'Title is required' })
  }

  return await generateUniqueSlug(title, ProjectModel, currentId)
})
