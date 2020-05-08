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

export const authenticateQuery = gql`
  mutation($username: String!, $password: String!) {
    authenticate(username: $username, password: $password) {
      accessToken,
      refreshToken,
      error {
        status
      }
    }
  }`

export const signupQuery = gql`
  mutation($username: String!, $password: String!, $captcha: String!) {
    createUser(username: $username, password: $password, captcha: $captcha) {
      accessToken,
      refreshToken,
      error {
        status,
        field
      }
    }
  }`
