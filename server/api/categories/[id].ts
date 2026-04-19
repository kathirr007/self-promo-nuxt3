import type { H3Event } from 'h3'
import { getCategoryById } from '~~/server/controllers/category'

export default defineEventHandler(async (event: H3Event) => {
  return await getCategoryById(event)
})
