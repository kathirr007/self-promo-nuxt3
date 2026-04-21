import type { H3Event } from 'h3'
import { onlyAdmin, onlyAuthUser } from '~~/server/controllers/auth'
import { deleteProductImage } from '~~/server/controllers/project'

export default defineEventHandler(async (event: H3Event) => {
  // DELETE /api/products/ProdImage/[id]

  const method = event.node.req.method

  switch (method) {
    case 'DELETE':
      await onlyAuthUser(event)
      await onlyAdmin(event)
      return await deleteProductImage(event)

    default:
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed',
      })
  }
})
