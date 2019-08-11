import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import main from './main'
import csgo from './csgo'
import views from './views'

export default (history) => combineReducers({
  router: connectRouter(history),
  main,
  csgo,
  views
})
