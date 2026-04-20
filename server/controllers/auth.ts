import type { H3Event } from 'h3'
import type { User } from '~~/server/models/types/user'

export async function onlyAuthUser(event: H3Event) {
  const { user } = await requireUserSession(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  return true
}

export async function onlyAdmin(event: H3Event) {
  const { user } = await requireUserSession(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  if ((user as User).role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  return true
}
