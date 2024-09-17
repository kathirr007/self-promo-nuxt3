// import { onlyAdmin, onlyAuthUser } from '@/server/controllers/auth.js'
import { getProducts } from '@/server/controllers/product.js'

export default defineEventHandler((event) => {
  return getProducts()
})
