import {
  TOGGLE_LOGIN_MODAL,
  TOGGLE_SETTINGS_MODAL,
  TOGGLE_SIGNUP_MODAL
} from '../constants'

const initialState = {
  openLoginModal: false,
  openSettingsModal: false,
  openSignupModal: false
}

const views = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_LOGIN_MODAL:
      return {
        ...state,
        openLoginModal: action.open,
        openSettingsModal: action.open ? false : state.openSettingsModal,
        openSignupModal: action.open ? false : state.openSignupModal
      }
    case TOGGLE_SETTINGS_MODAL:
      return {
        ...state,
        openLoginModal: action.open ? false : state.openLoginModal,
        openSettingsModal: action.open,
        openSignupModal: action.open ? false : state.openSignupModal
      }
    case TOGGLE_SIGNUP_MODAL:
      return {
        ...state,
        openLoginModal: action.open ? false : state.openLoginModal,
        openSettingsModal: action.open ? false : state.openSettingsModal,
        openSignupModal: action.open
      }
    default:
      return state
  }
}

export default views
