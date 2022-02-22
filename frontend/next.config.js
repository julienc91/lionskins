const nextTranslate = require('next-translate')
const { withSentryConfig } = require('@sentry/nextjs')

const csp = [
  "default-src 'self'",
  "script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://analytics.lionskins.co/",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: https:",
  'frame-src https://www.google.com/recaptcha/',
  "font-src 'self' data: https:",
  `connect-src 'self' ${process.env.NEXT_PUBLIC_API_DOMAIN} https://sentry.io/api/ https://analytics.lionskins.co/`
]

const moduleExports = nextTranslate({
  async headers () {
    if (process.env !== 'production') {
      return []
    }
    return [
      {
        source: '/(.*?)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp.join('; ')
          }
        ]
      }
    ]
  },
  async rewrites () {
    return [
      {
        source: '/sitemap.xml',
        destination: `${process.env.NEXT_PUBLIC_API_DOMAIN}/sitemap.xml`
      }
    ]
  }
})

const SentryWebpackPluginOptions = {
  silent: true
}

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports, SentryWebpackPluginOptions)
