// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxthub/core',
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxtjs/google-fonts",
    "@nuxtjs/i18n",
    "nuxt-gtag",
    "nuxt-auth-utils"
  ],
  hub: {
    database: true,
    kv: true,
    blob: true
  },
  nitro: {
    experimental: {
      // Enable Server API documentation within NuxtHub
      openAPI: true
    }
  },
  extends: ['@nuxt/ui-pro'],
  ui: {
    icons: ['simple-icons', 'heroicons']
  },
  css: ['~/assets/scss/main.scss'],
  googleFonts: {
    families: {
      Roboto: [100, 300, 400, 500, 700, 900],
      'Poetsen One': true
    }
  },
  i18n: {
    vueI18n: './i18n.config.ts' // if you are using custom path, default
  },
})