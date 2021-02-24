import React from 'react'
import { ApolloProvider } from '@apollo/client'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { appWithTranslation, useTranslation } from 'next-i18next'
import PropTypes from 'prop-types'
import { client } from '../apollo'
import { AuthenticationProvider } from '../components/AuthenticationProvider'
import { SettingsProvider } from '../components/SettingsProvider'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Matomo from '../components/Matomo'
import nextI18NextConfig from '../next-i18next.config.js'

import 'semantic-ui-css/semantic.min.css'
import 'swiper/swiper.scss'
import '../assets/css/index.scss'

const MyApp = ({ Component, pageProps }) => {
  const { t } = useTranslation()
  const router = useRouter()
  const locales = router.locales
  const path = router.asPath.split('?')[0].slice(4)
  return (
    <ApolloProvider client={client}>
      <AuthenticationProvider>
        <SettingsProvider>
          <Head>
            {locales.filter(locale => locale !== 'catchAll').map(locale => (
              <link
                key={`alternate-${locale}`} rel='alternate' hrefLang={locale}
                href={`${process.env.NEXT_PUBLIC_FRONTEND_DOMAIN}/${locale}/${path}`}
              />
            ))}
            <meta key='description' name='description' content={t('head.description')} />
          </Head>
          <Header />
          <main>
            <Component {...pageProps} />
          </main>
          <Footer />
          <Matomo />
        </SettingsProvider>
      </AuthenticationProvider>
    </ApolloProvider>
  )
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object
}

export default appWithTranslation(MyApp, nextI18NextConfig)
