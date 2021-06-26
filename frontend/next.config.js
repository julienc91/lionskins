const nextTranslate = require('next-translate')

const csp = [
  "default-src 'self'",
  "script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://analytics.lionskins.co/",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: https:",
  'frame-src https://www.google.com/recaptcha/',
  "font-src 'self' data: https:",
  `connect-src 'self' ${process.env.NEXT_PUBLIC_API_DOMAIN} https://sentry.io/api/ https://analytics.lionskins.co/`
]

module.exports = nextTranslate({
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
  async redirects () {
    return [
      {
        source: '/catchAll',
        destination: '/en',
        locale: false,
        permanent: false
      },
      {
        source: '/catchAll/:slug*',
        destination: '/en/:slug*',
        locale: false,
        permanent: false
      }
    ]
  }
})
