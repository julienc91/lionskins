import {
  TOGGLE_LOGIN_MODAL,
  TOGGLE_SETTINGS_MODAL,
  TOGGLE_SIGNUP_MODAL
} from '../constants'

export const toggleLoginModal = open => dispatch => {
  dispatch({ type: TOGGLE_LOGIN_MODAL, open })
}

export const toggleSettingsModal = open => dispatch => {
  dispatch({ type: TOGGLE_SETTINGS_MODAL, open })
}

export const toggleSignupModal = open => dispatch => {
  dispatch({ type: TOGGLE_SIGNUP_MODAL, open })
}
