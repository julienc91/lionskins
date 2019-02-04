import 'react-app-polyfill/ie9'
import React from 'react'
import ReactDOM from 'react-dom'
import './assets/css/index.css'
import 'semantic-ui-css/semantic.min.css'
import { Router } from 'react-router-dom'
import { IntlProvider } from 'react-intl'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import createHistory from 'history/createBrowserHistory'
import * as serviceWorker from './serviceWorker'

import App from './components/App'
import Tracker from './components/Tracker'

const httpLink = new HttpLink({ uri: `${process.env.REACT_APP_REDIRECT_DOMAIN}/graphql` })

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
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

serviceWorker.unregister();
