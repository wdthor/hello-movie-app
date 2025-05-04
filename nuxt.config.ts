// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/test-utils',
    '@nuxtjs/tailwindcss',
    'vuetify-nuxt-module',
    '@pinia/nuxt'],
  devtools: { enabled: true },
  compatibilityDate: '2024-11-01',
  eslint: {
    config: {
      stylistic: {
        indent: 2,
        semi: true,
        commaDangle: 'always-multiline',
        quotes: 'single',
      },
    },
  },
  runtimeConfig: {
    tmdbApiKey: process.env.TMDB_API_KEY,
    tinymceApiKey: process.env.TINYMCE_API_KEY,
    public: {
      tmdbBaseUrl: 'https://api.themoviedb.org/3',
      tmdbImageBaseUrl: 'https://image.tmdb.org/t/p'
    },
  }
});
