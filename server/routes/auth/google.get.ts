import type { User } from '~/server/utils/drizzle'

export default oauth.googleEventHandler({
  config: {
    authorizationParams: {
      access_type: 'offline',
    },
  },
  async onSuccess(event, result) {

    const { user: gUser } = result

    // Check if user already exist
    const user = await useDrizzle().select().from(tables.users).where(eq(tables.users.googleId, gUser.sub)).get()

    // If user not exist OR user's data changed (re)insert user date
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

    // Check if user already ve associate groups
    if (user) {
      const userGroups = await useDrizzle().select({id: tables.usersToGroups.groupId}).from(tables.usersToGroups).where(eq(tables.usersToGroups.userId, user.id))
      // Get EUR currency
      const eurCurrency = await useDrizzle().select().from(tables.currencies).where(eq(tables.currencies.isoCode, 'EUR')).get()
  
      // If user don't ve group
      // Create his privat group
      // Link it to user
      if (!userGroups) {
        const group = await useDrizzle().insert(tables.groups).values({
          name: 'Mon compte',
          private: true,
          currencyId: eurCurrency!.id
        }).returning().get();
        await useDrizzle().insert(tables.usersToGroups).values({
          userId: user!.id,
          groupId: group.id
        }).returning();
      }
      await setUserSession(event, {
        user: {
          id: user!.id,
          firstname: gUser.given_name,
          lastname: gUser.family_name,
          email: gUser.email,
          picture: gUser.picture,
          locale: gUser.locale,
          groupIds: userGroups.map(el => el.id)
        },
      })
    }


    return sendRedirect(event, `/`)
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