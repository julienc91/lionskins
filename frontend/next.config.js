const { nextI18NextRewrites } = require('next-i18next/rewrites')
const withPlugins = require('next-compose-plugins')
const optimizedImages = require('next-optimized-images')

const localeSubpaths = {
  en: 'en',
  fr: 'fr'
}

module.exports = withPlugins([
  [optimizedImages, {}],
  {
    rewrites: async () => nextI18NextRewrites(localeSubpaths),
    publicRuntimeConfig: {
      localeSubpaths
    }
  }
])
