import React from 'react'
import { ApolloProvider } from '@apollo/client'
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
  return (
    <ApolloProvider client={client}>
      <AuthenticationProvider>
        <SettingsProvider>
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
