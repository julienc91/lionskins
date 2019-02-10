import {
  SET_CURRENCY
} from '../constants'
import { Currencies } from '../components/enums'

const getDefaultCurrency = () => {
  let currency = localStorage.getItem('currency')
  if (!Currencies[currency]) {
    currency = Currencies.eur
  }
  return currency
}

const initialState = {
  currency: getDefaultCurrency()
}

const main = (state = initialState, action) => {
  switch (action.type) {
    case SET_CURRENCY:
      return {
        ...state,
        currency: action.currency
      }
    default:
      return state
  }
}

export default main
