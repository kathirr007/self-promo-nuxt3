// import { onlyAdmin, onlyAuthUser } from '@/server/controllers/auth.js'
import { getProducts } from '~~/server/controllers/project'

export default defineEventHandler(async () => {
  // const body = readBody(event)
  // console.log('body', body)
  const products = await getProducts()
  return products
})
