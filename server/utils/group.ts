import { type H3Event } from 'h3'
import { type UserSessionRequired } from '#auth-utils'


export async function requireUserGroupAccess(event: H3Event): Promise<UserSessionRequired> {
  const userSession = await getUserSession(event)
  const query = getQuery(event);
  /**
   * Verify if user ve group access
   * TODO get groupIds from userSession
   * TODO get groupId from request query
   * TODO verify if groupId is includes in groupIds
   * TODO if not throw error
   */
  // if (!userSession.user || userSession.user.roleType !== 'admin') {
  //   throw createError({
  //     statusCode: 401,
  //     message: 'Unauthorized',
  //   })
  // }

  return userSession as UserSessionRequired
}