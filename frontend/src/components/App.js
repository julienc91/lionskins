import React from 'react'
import Script from 'react-load-script'
import { Helmet } from 'react-helmet'
import { Switch, Route, Link } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import SkinList from '../views/csgo/SkinList'
import SkinPage from '../views/csgo/SkinPage'
import Header from './Header'
import Homepage from '../views/Homepage'
import About from '../views/About'
import Contact from '../views/Contact'
import Faq from '../views/Faq'
import PrivacyPolicy from '../views/PrivacyPolicy'
import PageNotFound from '../views/PageNotFound'
import PropTypes from 'prop-types'

class App extends React.Component {
  static getCopyright () {
    const startYear = 2018
    const currentYear = (new Date()).getFullYear()
    if (currentYear > startYear) {
      return `${startYear}-${currentYear}`
    }
    return startYear
  }

  render () {
    const { t } = this.props
    return [
      <Helmet key='helmet'>
        <title>{t('head.title')}</title>
        <link rel='canonical' href='https://lionskins.co/' />
        <meta name='description' content={t('head.description')} />
        <meta property='og:title' content={t('head.title')} />
        <meta property='og:description' content={t('head.decription')} />
        <meta property='og:image' content='https://lionskins.co/logo.png' />
      </Helmet>,
      <Header key='header' />,
      <main key='main'>
        <Switch>
          <Route exact path='/' component={Homepage} />
          <Route exact path='/about/' component={About} />
          <Route exact path='/contact/' component={Contact} />
          <Route exact path='/faq/' component={Faq} />
          <Route exact path='/privacy-policy/' component={PrivacyPolicy} />
          <Route exact path='/counter-strike-global-offensive/' component={SkinList} />
          <Route path='/counter-strike-global-offensive/:weapon/:slug/' component={SkinPage} />
          <Route component={PageNotFound} status={404} />
        </Switch>
      </main>,
      <footer key='footer'>
        <ul>
          <li>
            <Link to='/about/'>{t('footer.about')}</Link>
          </li>
          <li>
            <Link to='/contact/'>{t('footer.contact')}</Link>
          </li>
          <li>
            <Link to='/faq/'>{t('footer.faq')}</Link>
          </li>
          <li>
            <Link to='/privacy-policy/'>{t('footer.privacy_policy')}</Link>
          </li>
        </ul>
        <div>© {App.getCopyright()} - Lion Skins</div>
      </footer>,
      <Script key='tracker' url='https://analytics.lionskins.co/init.js' attributes={{ async: true, defer: true }} />
    ]
  }
}

App.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(App)
