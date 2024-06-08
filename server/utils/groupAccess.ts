import { type H3Event } from 'h3'
import { type UserSessionRequired } from '#auth-utils'

export async function requireUserGroupAccess(event: H3Event, groupIds: Array<Number>): Promise<UserSessionRequired> {

  const userSession = await getUserSession(event) // Get userSession 
  const { user } = userSession // Destructure user object from userSession
  const userGroupIds = user?.groupIds // Get user's groupIds from userSession

  if (user) { // Verify if groupId and user re present or throw error
    if (userGroupIds && userGroupIds.length > 0) { // Verify if user ve some group or throw error
      if (!groupIds.every((v: Number) => userGroupIds.includes(v))) { // Check if all groupIds params are include in userSession
        throw createError({
          statusCode: 401,
          message: 'Unauthorized',
        })
      }
    } else {
      throw createError({
        statusCode: 404,
        message: 'User don\'t ve any linked group',
      })
    }
  } else {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  return userSession as UserSessionRequired
}