import {
  CSGO_LOAD_SKINS,
  CSGO_RESET_SKINS,
  CSGO_SET_FILTERS,
  CSGO_SET_SKINS
} from '../constants'

const getInitialFilters = () => {
  const params = window.location.hash.substr(1).split('&')
  const allowedFilters = ['statTrak', 'souvenir', 'search', 'rarity', 'quality', 'weapon', 'category', 'group']
  const res = {}

  params.forEach(param => {
    const parsedParam = param.split('=')
    const filter = parsedParam[0]
    if (allowedFilters.includes(filter)) {
      let value = parsedParam[1]
      if (filter === 'search') {
        value = decodeURIComponent(value)
      } else if (value === 'true') {
        value = true
      } else if (value === 'false') {
        value = false
      }
      res[filter] = value
    }
  })
  return res
}

const initialState = {
  filters: {
    statTrak: null,
    souvenir: null,
    search: '',
    rarity: null,
    quality: null,
    weapon: null,
    category: null,
    group: true,
    ...getInitialFilters(),
    first: 50
  },
  skins: [],
  loading: false,
  hasNextPage: true,
  nextCursor: null
}

const csgo = (state = initialState, action) => {
  switch (action.type) {
    case CSGO_LOAD_SKINS:
      return {
        ...state,
        loading: true
      }
    case CSGO_SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.filters }
      }
    case CSGO_RESET_SKINS:
      return {
        ...state,
        skins: [],
        hasNextPage: true,
        nextCursor: null
      }
    case CSGO_SET_SKINS:
      return {
        ...state,
        skins: [...state.skins, ...action.skins],
        loading: false,
        hasNextPage: action.hasNextPage,
        nextCursor: action.nextCursor
      }
    default:
      return state
  }
}

export default csgo
