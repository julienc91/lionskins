import 'react-app-polyfill/ie9'
import React from 'react'
import ReactDOM from 'react-dom'
import './assets/css/index.css'
import 'semantic-ui-css/semantic.min.css'
import { Router } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import { ApolloProvider } from 'react-apollo'
import ApolloClient from 'apollo-boost'
import createHistory from 'history/createBrowserHistory'
import * as serviceWorker from './serviceWorker'

import App from './components/App'
import Tracker from './components/Tracker'

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_REDIRECT_DOMAIN}/graphql`
})

const history = createHistory()
const tracker = new Tracker()

ReactDOM.render(
  <IntlProvider locale='en'>
    <Router history={tracker.connectToHistory(history)}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </Router>
  </IntlProvider>,
  document.getElementById('root')
)

serviceWorker.unregister()
