import React from 'react'
import { ApolloProvider } from '@apollo/client'
import PropTypes from 'prop-types'
import { client } from '../apollo'
import { AuthenticationProvider } from '../components/AuthenticationProvider'
import { SettingsProvider } from '../components/SettingsProvider'
import Footer from '../components/Footer'
import PageHead from '../components/Head'
import Header from '../components/Header'
import Matomo from '../components/Matomo'

import 'semantic-ui-css/semantic.min.css'
import 'swiper/swiper.scss'
import '../assets/css/index.scss'

const MyApp = ({ Component, pageProps }) => {
  return (
    <ApolloProvider client={client}>
      <AuthenticationProvider>
        <SettingsProvider>
          <PageHead />
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

export default MyApp
