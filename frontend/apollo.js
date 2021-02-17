import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { relayStylePagination } from '@apollo/client/utilities'
import AuthenticationManager from './utils/authentication'

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_API_DOMAIN}/graphql`
})

const authLink = setContext((_, { headers }) => {
  const accessToken = AuthenticationManager.getToken()
  return {
    headers: {
      ...headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` })
    }
  }
})

const refreshAuthLink = setContext((_, { headers }) => {
  const refreshToken = AuthenticationManager.getRefreshToken()
  return {
    headers: {
      ...headers,
      ...(refreshToken && { Authorization: `Bearer ${refreshToken}` })
    }
  }
})

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          csgo: relayStylePagination(['weapon', 'slug', 'category', 'quality', 'rarity', 'statTrak', 'souvenir', 'search', 'group']),
          inventory: relayStylePagination(['steamId'])
        }
      }
    }
  })
})

export const refreshClient = new ApolloClient({
  link: refreshAuthLink.concat(httpLink),
  cache: new InMemoryCache()
})
