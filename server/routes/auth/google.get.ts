import type { User } from '~/server/utils/drizzle'

export default oauth.googleEventHandler({
  config: {
    authorizationParams: {
      access_type: 'offline',
    },
  },
  async onSuccess(event, result) {

    const { user: gUser } = result

    const user = await useDrizzle().select().from(tables.users).where(eq(tables.users.googleId, gUser.sub)).get()

    if (!user || userDataChanged(user, gUser)) {
      await useDrizzle().insert(tables.users).values({
        googleId: gUser.sub,
        firstname: gUser.given_name,
        lastname: gUser.family_name,
        email: gUser.email,
        picture: gUser.picture,
        locale: gUser.locale
      })
        .onConflictDoUpdate({
          target: tables.users.googleId,
          set: {
            firstname: gUser.given_name,
            lastname: gUser.family_name,
            email: gUser.email,
            picture: gUser.picture,
            locale: gUser.locale
          },
        })
        .execute()
    }
    
    await setUserSession(event, {
      user: {
        firstname: gUser.given_name,
        lastname: gUser.family_name,
        email: gUser.email,
        picture: gUser.picture,
        locale: gUser.locale
      }
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