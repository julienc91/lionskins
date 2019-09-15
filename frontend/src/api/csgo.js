import gql from 'graphql-tag'

export const getSkinsQuery = gql`
  query ($first: Int, $after: String, $weapon: CSGOWeapons, $category: CSGOCategories,
         $quality: CSGOQualities, $rarity: CSGORarities, $statTrak: Boolean, $souvenir: Boolean,
         $search: String, $currency: TypeCurrency) {
    csgo (first: $first, after: $after, weapon: $weapon, category: $category,
          quality: $quality, rarity: $rarity, statTrak: $statTrak, souvenir: $souvenir,
          search: $search) {
      pageInfo {
        hasNextPage
        endCursor
      }
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

export const getSkinHistoryQuery = gql`
  query ($skin: String, $currency: TypeCurrency) {
    history (skin: $skin) {
      edges {
        node {
          provider,
          price (currency: $currency),
          creationDate
        }
      }
    }
  }`

export const getSkinQuery = gql`
  query ($weapon: CSGOWeapons, $slug: String, $currency: TypeCurrency) {
    csgo (weapon: $weapon, slug: $slug) {
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
