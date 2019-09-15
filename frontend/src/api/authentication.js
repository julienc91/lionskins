import gql from 'graphql-tag'

export const refreshTokenQuery = gql`
  mutation {
    refreshToken {
      accessToken
    }
  }`

export const authenticateQuery = gql`
  mutation($username: String!, $password: String!) {
    authenticate(username: $username, password: $password) {
      accessToken,
      refreshToken
    }
  }`

export const signupQuery = gql`
  mutation($username: String!, $password: String!, $captcha: String!) {
    createUser(username: $username, password: $password, captcha: $captcha) {
      accessToken,
      refreshToken
    }
  }`
