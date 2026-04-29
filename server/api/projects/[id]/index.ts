import { onlyAdmin } from '~~/server/controllers/auth'
import { deleteProject, getProjectById, updateProject } from '~~/server/controllers/project'
import { deleteImages } from '~~/server/controllers/upload-photo'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  switch (method) {
    case 'GET':
      return await getProjectById(event)
    case 'PATCH':
      // PATCH /api/projects/[id]
      await onlyAdmin(event)
      await deleteImages(event)
      return await updateProject(event)

    case 'DELETE':
      // DELETE /api/projects/[id]
      await onlyAdmin(event)
      await deleteImages(event)
      return await deleteProject(event)

    default:
      throw createError({ statusCode: 404, message: 'Not Found api router' })
  }
})
