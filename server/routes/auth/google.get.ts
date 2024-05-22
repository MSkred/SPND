export default oauth.googleEventHandler({
  config: {
    authorizationParams: {
      access_type: 'offline',
    },
  },
  async onSuccess(event, { user }) {
    await setUserSession(event, {
      user: {
        google_id: user.sub,
        firstname: user.given_name,
        lastname: user.family_name,
        email: user.email,
        picture: user.picture,
        locale: user.locale
      },
      loggedInAt: Date.now(),
    })

    return sendRedirect(event, '/')
  },
})