// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxthub/core', "@nuxt/eslint", "@nuxt/ui", "@nuxtjs/google-fonts"],
  hub: {
    database: true,
  },
  nitro: {
    experimental: {
      // Enable Server API documentation within NuxtHub
      openAPI: true
    }
  },
  googleFonts: {
    families: {
      Roboto: [100, 300, 400, 500, 700, 900],
      'Poetsen One': true
    }
  },
})