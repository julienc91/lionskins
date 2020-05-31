import {
  SET_CURRENCY,
  SET_USER,
  SET_LISTS,
  UNSET_USER,
  SET_ACCESS_TOKEN,
  SET_REFRESH_TOKEN
} from '../constants'
import { Currencies } from '../components/enums'
import { StorageManager } from '../tools'

// get the currency to use based on potentially previously set value
const getDefaultCurrency = () => {
  let currency = StorageManager.get('currency')
  if (!Currencies[currency]) {
    currency = Currencies.eur
  }
  return currency
}

const getRefreshToken = () => {
  return StorageManager.get('refreshToken')
}

const initialState = {
  currency: getDefaultCurrency(),
  accessToken: null,
  refreshToken: getRefreshToken(),
  user: null,
  lists: null
}

const main = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENCY:
      return {
        ...state,
        currency: action.currency
      }
    case SET_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: action.accessToken
      }
    case SET_REFRESH_TOKEN:
      StorageManager.set('refreshToken', action.refreshToken)
      return {
        ...state,
        refreshToken: action.refreshToken
      }
    case SET_USER:
      return {
        ...state,
        user: action.user
      }
    case SET_LISTS:
      return {
        ...state,
        lists: action.lists
      }
    case UNSET_USER:
      StorageManager.remove('refreshToken')
      return {
        ...state,
        user: null,
        lists: null,
        accessToken: null,
        refreshToken: null
      }
    default:
      return state
  }
}

export default main
