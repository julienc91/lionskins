import gql from 'graphql-tag'

export const refreshTokenQuery = gql`
  mutation {
    refreshToken {
      accessToken,
      error {
        status
      }
    }
  }`
