import ApolloClient from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from 'apollo-cache-inmemory'
import store from './configureStore'

const httpLink = createHttpLink({
  uri: `${process.env.REACT_APP_API_DOMAIN}/graphql`
})

const authLink = setContext((_, { headers }) => {
  const state = store.getState()
  const { accessToken } = state.main
  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : ''
    }
  }
})

const refreshAuthLink = setContext((_, { headers }) => {
  const state = store.getState()
  const { refreshToken } = state.main
  return {
    headers: {
      ...headers,
      authorization: refreshToken ? `Bearer ${refreshToken}` : ''
    }
  }
})

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

const refreshClient = new ApolloClient({
  link: refreshAuthLink.concat(httpLink),
  cache: new InMemoryCache()
})

export default client
export {
  refreshClient
}
