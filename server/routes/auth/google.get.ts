import type { User } from '~/server/utils/drizzle'

export default oauth.googleEventHandler({
  config: {
    authorizationParams: {
      access_type: 'offline',
    },
  },
  async onSuccess(event, { user: gUser }) {

    const userPayload = {
      google_id: gUser.sub,
      firstname: gUser.given_name,
      lastname: gUser.family_name,
      email: gUser.email,
      picture: gUser.picture,
      locale: gUser.locale,
      createdAt: new Date()
    }

    const user = await useDrizzle().select().from(tables.users).where(eq(tables.users.google_id, userPayload.google_id)).get()

    if (!user || userDataChanged(user, userPayload)) {
      if (user) userPayload.createdAt = user.createdAt;
      await useDrizzle().insert(tables.users).values(userPayload)
        .onConflictDoUpdate({
          target: tables.users.google_id,
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
  return user.google_id !== gUser.sub
    || user.email !== gUser.email
    || user.firstname !== gUser.given_name
    || user.lastname !== gUser.family_name
    || user.picture !== gUser.picture
    || user.locale !== gUser.locale
}