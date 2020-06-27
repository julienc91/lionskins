import React from 'react'
import * as Sentry from '@sentry/browser'
import Script from 'react-load-script'
import { Helmet } from 'react-helmet'
import { Switch, Route, Link } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import InventoryPage from '../views/csgo/InventoryPage'
import PlayerInventoryPage from '../views/csgo/PlayerInventoryPage'
import SkinList from '../views/csgo/SkinList'
import SkinPage from '../views/csgo/SkinPage'
import TeamList from '../views/csgo/TeamList'
import Header from './Header'
import { ListManagementModal, LoginModal, SettingsModal } from './modals'
import AuthenticationProcess from './AuthenticationProcess'
import Homepage from '../views/Homepage'
import About from '../views/About'
import Contact from '../views/Contact'
import Faq from '../views/Faq'
import PrivacyPolicy from '../views/PrivacyPolicy'
import PageNotFound from '../views/PageNotFound'
import UserList from '../views/UserList'
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

  componentDidCatch (error, errorInfo) {
    if (process.env.REACT_APP_SENTRY_DSN && process.env.NODE_ENV === 'production') {
      Sentry.withScope(scope => {
        scope.setExtras(errorInfo)
        Sentry.captureException(error)
      })
    }
  }

  render () {
    const { t } = this.props
    return [
      <Helmet
        key='helmet'
        title={t('head.title')}
        meta={[
          { name: 'description', content: t('head.description') },
          { property: 'og:title', content: t('head.title') },
          { property: 'og:description', content: t('head.decription') },
          { property: 'og:image', content: 'https://lionskins.co/logo.png' }
        ]}
      />,
      <AuthenticationProcess key='authentication-process' />,
      <SettingsModal key='settings' />,
      <LoginModal key='login' />,
      <ListManagementModal key='lists' />,
      <Header key='header' />,
      <main key='main'>
        <Switch>
          <Route exact path='/' component={Homepage} />
          <Route exact path='/about/' component={About} />
          <Route exact path='/contact/' component={Contact} />
          <Route exact path='/faq/' component={Faq} />
          <Route exact path='/privacy-policy/' component={PrivacyPolicy} />
          <Route exact path='/counter-strike-global-offensive/' component={SkinList} />
          <Route exact path='/counter-strike-global-offensive/my-inventory' component={InventoryPage} />
          <Route exact path='/counter-strike-global-offensive/teams/' component={TeamList} />
          <Route exact path='/counter-strike-global-offensive/teams/:team/:player/' component={PlayerInventoryPage} />
          <Route path='/counter-strike-global-offensive/:weapon/:slug/' component={SkinPage} />
          <Route path='/lists/:id/:slug/' component={UserList} />
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
        <div>© {App.getCopyright()} - LionSkins</div>
      </footer>,
      <Script key='tracker' url='https://analytics.lionskins.co/init.js' attributes={{ async: true, defer: true }} />
    ]
  }
}

App.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(App)
