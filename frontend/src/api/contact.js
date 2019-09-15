import gql from 'graphql-tag'

export const contactQuery = gql`
  mutation contact($name: String, $email: String, $message: String!, $captcha: String!) {
    contact(name: $name, email: $email, message: $message, captcha: $captcha) {
      id 
    }
  }`
