import gql from 'graphql-tag'

export const getInventoryQuery = gql`
  query ($steamId: String!, $currency: TypeCurrency) {
    inventory (steamId: $steamId) {
      edges {
        node {
          id
          name
          slug
          imageUrl
          statTrak
          quality
          rarity
          souvenir
          weapon {
            name
            category
          }
          prices {
            price (currency: $currency)
            provider
          }
        }
      }
    }
  }`
