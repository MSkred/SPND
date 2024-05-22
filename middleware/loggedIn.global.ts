export default defineNuxtRouteMiddleware((to, from) => {
console.log('MIDDLE', );
    const { loggedIn } = useUserSession()
   
    if (!loggedIn.value && to.name !== 'login') {
        return navigateTo('/login')
    }

})