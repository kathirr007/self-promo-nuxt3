import { createHero, deleteProjectHero, getProductHeroes, updateProductHero } from '~~/server/controllers/product-hero'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    return await getProductHeroes(event)
  }
  else if (method === 'POST') {
    return await createHero(event)
  }
  else if (method === 'PUT') {
    return await updateProductHero(event)
  }
  else if (method === 'DELETE') {
    return await deleteProjectHero(event)
  }
})
