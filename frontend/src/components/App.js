import React from 'react'
import Script from 'react-load-script'
import { Switch, Route, Link } from 'react-router-dom'
import SkinList from './csgo/SkinList'
import SkinPage from './csgo/SkinPage'
import Header from './Header'
import Homepage from './Homepage'
import About from './About'
import Contact from './Contact'
import Faq from './Faq'
import PrivacyPolicy from './PrivacyPolicy'
import PageNotFound from './PageNotFound'

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
    return [
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
            <Link to='/about/'>
              About</Link>
          </li>
          <li>
            <Link to='/contact/'>
              Contact Us</Link>
          </li>
          <li>
            <Link to='/faq/'>
              FAQ</Link>
          </li>
          <li>
            <Link to='/privacy-policy/'>
              Privacy Policy</Link>
          </li>
        </ul>
        <div>© {App.getCopyright()} - Lion Skins</div>
      </footer>,
      <Script key='tracker' url='https://analytics.lionskins.co/init.js' attributes={{ async: true, defer: true }} />
    ]
  }
}

export default App
