import {
  TOGGLE_LIST_MANAGEMENT_MODAL,
  TOGGLE_LOGIN_MODAL,
  TOGGLE_SETTINGS_MODAL
} from '../constants'

const initialState = {
  openListManagementModal: false,
  openLoginModal: false,
  openSettingsModal: false
}

const views = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_LIST_MANAGEMENT_MODAL:
      return {
        ...state,
        openListManagementModal: action.open
      }
    case TOGGLE_LOGIN_MODAL:
      return {
        ...state,
        openLoginModal: action.open
      }
    case TOGGLE_SETTINGS_MODAL:
      return {
        ...state,
        openSettingsModal: action.open
      }
    default:
      return state
  }
}

export default views
