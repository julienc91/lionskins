import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { withTranslation } from 'react-i18next'
import { Header, Image } from 'semantic-ui-react'
import Carousel from '../components/carousel'
import PropTypes from 'prop-types'

import logo from '../assets/images/logo.svg'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'

class Homepage extends Component {
  render () {
    const { t } = this.props
    return (
      <div className='homepage'>
        <Helmet
          title={t('homepage.page_title')}
        />

        <Image src={logo} alt='' className='logo' />
        <Header as='h1'>{t('homepage.title')}</Header>
        <Header as='h2'>
          {t('homepage.subtitle1')}<br />
          {t('homepage.subtitle2')}
        </Header>
        <Carousel />
        <script type='application/ld+json'>
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: 'https://lionskins.co/',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://lionskins.co/counter-strike-global-offensive/#search={search_term_string}',
              'query-input': 'required name=search_term_string'
            }
          })}
        </script>
      </div>
    )
  }
}

Homepage.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(Homepage)
