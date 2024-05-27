export default defineNuxtRouteMiddleware((to, from) => {
    const { loggedIn } = useUserSession()
   
    if (!loggedIn.value && to.name !== 'login') {
        return navigateTo('/login')
    }

})