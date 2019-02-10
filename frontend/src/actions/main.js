import {
  SET_CURRENCY,
  CSGO_RESET_SKINS
} from '../constants'
import { Currencies } from '../components/enums'
import { getSkinList } from './csgo'

export const changeCurrency = currency => (dispatch, getState) => {
  if (currency !== getState().main.currency) {
    if (Currencies[currency]) {
      localStorage.setItem('currency', currency)
      dispatch({ type: SET_CURRENCY, currency })
      dispatch({ type: CSGO_RESET_SKINS })
      dispatch(getSkinList())
    }
  }
}
