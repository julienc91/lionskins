import {
  TOGGLE_LIST_MANAGEMENT_MODAL,
  TOGGLE_LOGIN_MODAL,
  TOGGLE_SETTINGS_MODAL
} from '../constants'

export const toggleListManagementModal = open => dispatch => {
  dispatch({ type: TOGGLE_LIST_MANAGEMENT_MODAL, open })
}

export const toggleLoginModal = open => dispatch => {
  dispatch({ type: TOGGLE_LOGIN_MODAL, open })
}

export const toggleSettingsModal = open => dispatch => {
  dispatch({ type: TOGGLE_SETTINGS_MODAL, open })
}
