import Cookies from 'js-cookie'
import StorageManager from './StorageManager'

class AuthenticationManager {
  getToken () {
    return Cookies.get('token')
  }

  getRefreshToken () {
    return Cookies.get('refreshToken')
  }

  setToken (token) {
    if (token) {
      Cookies.set('token', token, { sameSite: 'strict' })
    } else {
      Cookies.remove('token')
    }
  }

  setRefreshToken (token) {
    if (token) {
      Cookies.set('refreshToken', token, { expires: 90, sameSite: 'strict' })
    } else {
      Cookies.remove('refreshToken')
    }
  }

  startOpenId () {
    StorageManager.set('openid.redirect', window.location.pathname.substr(3), false)
    window.location = `${process.env.NEXT_PUBLIC_API_DOMAIN}/steam/login`
  }
}

export default new AuthenticationManager()
