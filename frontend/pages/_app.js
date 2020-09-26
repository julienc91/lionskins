import React, { useContext } from 'react'
import { ApolloProvider } from '@apollo/client'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { I18nContext } from 'next-i18next'
import PropTypes from 'prop-types'
import { client } from '../apollo'
import { appWithTranslation } from '../i18n'
import { AuthenticationProvider } from '../components/AuthenticationProvider'
import { SettingsProvider } from '../components/SettingsProvider'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Matomo from '../components/Matomo'

import 'semantic-ui-css/semantic.min.css'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import '../assets/css/index.scss'

const MyApp = ({ Component, pageProps }) => {
  const { i18n } = useContext(I18nContext)
  const router = useRouter()
  const languages = [i18n.options.defaultLanguage, ...i18n.options.otherLanguages]
  const path = router.asPath.split('?')[0].slice(4)
  return (
    <ApolloProvider client={client}>
      <AuthenticationProvider>
        <SettingsProvider>
          <Head>
            {languages.map(language => (
              <link
                key={`alternate-${language}`} rel='alternate' hrefLang={language}
                href={`${process.env.NEXT_PUBLIC_FRONTEND_DOMAIN}/${language}/${path}`}
              />
            ))}
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

export default appWithTranslation(MyApp)
