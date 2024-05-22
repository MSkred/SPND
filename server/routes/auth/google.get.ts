import type { User } from '~/server/utils/drizzle'

export default oauth.googleEventHandler({
  config: {
    authorizationParams: {
      access_type: 'offline',
    },
  },
  async onSuccess(event, { user: gUser }) {

    const userPayload = {
      googleId: gUser.sub,
      firstname: gUser.given_name,
      lastname: gUser.family_name,
      email: gUser.email,
      picture: gUser.picture,
      locale: gUser.locale
    }

    const user = await useDrizzle().select().from(tables.users).where(eq(tables.users.googleId, userPayload.googleId)).get()

    if (!user || userDataChanged(user, userPayload)) {
      await useDrizzle().insert(tables.users).values(userPayload)
        .onConflictDoUpdate({
          target: tables.users.googleId,
          set: userPayload,
        })
        .execute()
    }
    
    await setUserSession(event, {
      user: userPayload
    })

    return sendRedirect(event, '/')
  },
})

interface GoogleUser {
  id: number
  sub: string
  email: string
  given_name: string
  family_name: string
  picture: string
  locale: string
}

function userDataChanged(user: User, gUser: GoogleUser) {
  return user.googleId !== gUser.sub
    || user.email !== gUser.email
    || user.firstname !== gUser.given_name
    || user.lastname !== gUser.family_name
    || user.picture !== gUser.picture
    || user.locale !== gUser.locale
}