import {
  CSGO_RESET_SKINS,
  SET_ACCESS_TOKEN,
  SET_CURRENCY, SET_LISTS,
  SET_REFRESH_TOKEN,
  SET_USER,
  UNSET_USER,
  SET_STEAM_ID,
  UNSET_STEAM_ID
} from '../constants'
import { Currencies } from '../components/enums'
import { getSkinList } from './csgo'
import i18n from '../i18n'
import moment from 'moment'
import 'moment/locale/fr'
import { StorageManager } from '../tools'

export const changeCurrency = currency => (dispatch, getState) => {
  if (currency !== getState().main.currency) {
    if (Currencies[currency]) {
      StorageManager.set('currency', currency)
      dispatch({ type: SET_CURRENCY, currency })
      dispatch({ type: CSGO_RESET_SKINS })
      dispatch(getSkinList())
    }
  }
}

export const changeLanguage = language => () => {
  i18n.changeLanguage(language)
  moment.locale(language)
}

export const setAccessToken = accessToken => dispatch => {
  dispatch({ type: SET_ACCESS_TOKEN, accessToken })
}

export const setRefreshToken = refreshToken => dispatch => {
  dispatch({ type: SET_REFRESH_TOKEN, refreshToken })
}

export const setUser = user => dispatch => {
  dispatch({ type: SET_USER, user })
}

export const setSteamId = steamId => dispatch => {
  dispatch({ type: SET_STEAM_ID, steamId })
}

export const unsetSteamId = () => dispatch => {
  dispatch({ type: UNSET_STEAM_ID })
}

export const unsetUser = () => dispatch => {
  dispatch({ type: UNSET_USER })
}

export const setUserLists = lists => dispatch => {
  dispatch({ type: SET_LISTS, lists })
}
