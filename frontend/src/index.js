import 'react-app-polyfill/ie9'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import './assets/css/index.css'
import 'semantic-ui-css/semantic.min.css'
import { ConnectedRouter } from 'connected-react-router'
import { ApolloProvider } from 'react-apollo'
import { Provider } from 'react-redux'
import * as serviceWorker from './serviceWorker'

import configureStore, { history } from './configureStore'
import client from './apollo'
import App from './components/App'
import Tracker from './components/tools/Tracker'

import './i18n'

const store = configureStore()
const tracker = new Tracker()

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={tracker.connectToHistory(history)}>
      <ApolloProvider client={client}>
        <Suspense fallback={<div>Loading</div>}>
          <App />
        </Suspense>
      </ApolloProvider>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)

serviceWorker.unregister()
