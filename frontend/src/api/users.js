import gql from 'graphql-tag'

export const getUserQuery = gql`
  query {
    currentUser {
      id,
      username
    }
  }`
