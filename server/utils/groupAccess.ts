import { type H3Event } from 'h3'
import { type UserSessionRequired } from '#auth-utils'

export async function requireUserGroupAccess(event: H3Event): Promise<UserSessionRequired> {

  const userSession = await getUserSession(event) // Get userSession 
  const { user } = userSession // Destructure user object from userSession
  const userGroupIds = user?.groupIds // Get user's groupIds from userSession
  const { groupId } = await getQuery(event) as { groupId: string }; // Get groupId from request query

  if (groupId && user) { // Verify if groupId and user re present or throw error
    if (userGroupIds && userGroupIds.length > 0) { // Verify if user ve some group or throw error
      if (!userGroupIds.includes(parseInt(groupId))) { // Verify is groupId from request is include is user's group from session 
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
      message: 'User or groupId not found',
    })
  }

  return userSession as UserSessionRequired
}