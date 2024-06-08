export default defineEventHandler(async (event) => {
  // Get current user session 
  let userSession = await getUserSession(event);

  // Verify if userSession or throw error
  if (userSession) {
    // SQL request
    const groups = await useDrizzle()
      .select({id: tables.groups.id, name: tables.groups.name, currency_id: tables.groups.currencyId, private: tables.groups.private, createdAt: tables.groups.createdAt, updatedAt: tables.groups.updatedAt })
      .from(tables.groups)
      .innerJoin(tables.usersToGroups, eq(tables.groups.id, tables.usersToGroups.groupId))
      .where(eq(tables.usersToGroups.userId, userSession.user.id))
  
    // Update userSession with getting group from database
    const groupIds = groups.map(el => el.id)
    userSession.user.groupIds = groupIds;
    await replaceUserSession(event, userSession)
    
    return groups
  } else {
     throw createError({
      statusCode: 404,
      message: 'User sessio not found',
    })
  }
})