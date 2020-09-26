import React from 'react'
import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps (ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    const additionalProps = {
      language: ctx.req.language
    }
    return { ...initialProps, ...additionalProps }
  }

  render () {
    const { language } = this.props
    const csp = [
      "default-src 'self'",
      "script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://analytics.lionskins.co/",
      "style-src 'self' 'unsafe-inline' https:",
      "img-src 'self' data: https:",
      'frame-src https://www.google.com/recaptcha/',
      "font-src 'self' data: https:",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API_DOMAIN} https://sentry.io/api/`
    ]

    return (
      <Html lang={language}>
        <Head>
          {process.env.NODE_ENV === 'production' && (
            <meta httpEquiv='Content-Security-Policy' content={csp.join('; ')} />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
