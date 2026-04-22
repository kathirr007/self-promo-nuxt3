import { onlyAdmin, onlyAuthUser } from '~~/server/controllers/auth'
import { getAdminProjects } from '~~/server/controllers/project'

export default defineEventHandler(async (event) => {
  // GET /api/products/user-products
  const isAuthUser = await onlyAuthUser(event)
  const isAdmin = await onlyAdmin(event)
  if (!isAuthUser || !isAdmin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
  return await getAdminProjects(event)
})
