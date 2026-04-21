import { onlyAdmin, onlyAuthUser } from '~~/server/controllers/auth'
import { deleteProduct, getProductById, updateProduct } from '~~/server/controllers/project'
import { deleteImages } from '~~/server/controllers/upload-photo'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  switch (method) {
    case 'GET':
      return await getProductById(event)
    case 'PATCH':
      // PATCH /api/products/[id]
      await onlyAuthUser(event)
      await onlyAdmin(event)
      await deleteImages(event)
      return await updateProduct(event)

    case 'DELETE':
      // DELETE /api/products/[id]
      await onlyAuthUser(event)
      await onlyAdmin(event)
      await deleteImages(event)
      return await deleteProduct(event)

    default:
      throw createError({ statusCode: 404, message: 'Not Found api router' })
  }
})
