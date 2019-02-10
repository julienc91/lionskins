import ApolloClient from 'apollo-boost'

const client = new ApolloClient({
  uri: `${process.env.REACT_APP_REDIRECT_DOMAIN}/graphql`
})

export default client
