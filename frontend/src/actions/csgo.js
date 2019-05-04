import gql from 'graphql-tag'
import client from '../apollo'
import {
  CSGO_LOAD_SKINS,
  CSGO_RESET_SKINS,
  CSGO_SET_FILTERS,
  CSGO_SET_SKINS
} from '../constants'

const hasFilterChanged = (oldFilters, newFilters) => {
  const keys = ['search', 'weapon', 'category', 'quality', 'rarity', 'statTrak', 'souvenir']
  return keys.some(key => (
    oldFilters[key] !== newFilters[key]
  ))
}

export const changeFilter = filters => (dispatch, getState) => {
  const oldFilters = getState().csgo.filters
  dispatch({ type: CSGO_SET_FILTERS, filters })
  filters = getState().csgo.filters
  if (hasFilterChanged(oldFilters, filters)) {
    const hashParameters = {
      search: '',
      weapon: null,
      category: null,
      quality: null,
      rarity: null,
      statTrak: null,
      souvenir: null
    }
    const hash = []
    Object.keys(filters).forEach(filter => {
      if (hashParameters[filter] !== undefined && hashParameters[filter] !== filters[filter]) {
        let value = filters[filter]
        if (filter === 'search') {
          value = encodeURIComponent(value)
        }
        hash.push(`${filter}=${value}`)
      }
    })
    window.location.hash = `#${hash.join('&')}`
    dispatch({ type: CSGO_RESET_SKINS })
    dispatch(getSkinList())
  }
}

export const resetSkinList = () => (dispatch) => {
  dispatch({ type: CSGO_RESET_SKINS })
}

export const getSkinList = () => (dispatch, getState) => {
  const { csgo, main } = getState()
  if (csgo.loading) {
    return
  }

  dispatch({ type: CSGO_LOAD_SKINS })

  const variables = {
    ...csgo.filters,
    after: csgo.nextCursor,
    currency: main.currency
  }
  const oldFilters = csgo.filters

  const query = gql`
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
          prices (currency: $currency) {
            price
            currency
            provider
          }
        }
      }
    }
  }`

  client.query({
    query,
    variables
  }).then(response => {
    if (!hasFilterChanged(oldFilters, getState().csgo.filters)) {
      dispatch({
        type: CSGO_SET_SKINS,
        skins: response.data.csgo.edges.map(e => e.node),
        hasNextPage: response.data.csgo.pageInfo.hasNextPage,
        nextCursor: response.data.csgo.pageInfo.endCursor
      })
    }
  })
}
