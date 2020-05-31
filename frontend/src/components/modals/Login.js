import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { Modal } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { startOpenId, StorageManager } from '../../tools'
import * as actions from '../../actions'
import client from '../../apollo'
import { history } from '../../configureStore'
import { getUserQuery } from '../../api/users'
import steamOpenId from '../../assets/images/steam_openid.png'

class LoginModal extends Component {
  componentDidMount () {
    const { user } = this.props
    if (window.location.search.indexOf('authenticated') >= 0) {
      const redirect = StorageManager.get('openid.redirect', false)
      StorageManager.remove('openid.redirect')
      if (redirect && redirect !== window.location.pathname) {
        window.history.replaceState(null, '', window.location.pathname)
        history.replace(redirect)
      } else {
        window.history.replaceState(null, '', window.location.pathname)
      }
      if (!user) {
        this.handleAuthenticated()
      }
    }
  }

  async handleAuthenticated () {
    const response = await window.fetch(`${process.env.REACT_APP_API_DOMAIN}/rest/jwt/`, {
      method: 'post',
      credentials: 'include'
    })
    if (!response.ok) {
      return
    }

    const data = await response.json()
    const { setAccessToken, setRefreshToken, setUser } = this.props
    const { accessToken, refreshToken } = data
    setRefreshToken(refreshToken)
    setAccessToken(accessToken)
    client.query({
      query: getUserQuery
    }).then(response => {
      const user = response.data.currentUser
      setUser(user)
    })
  }

  render () {
    const { open, toggleLoginModal, user, t } = this.props
    if (user) {
      open && toggleLoginModal(false)
      return null
    }
    return (
      <Modal open={open} onClose={() => toggleLoginModal(false)} className='login-modal'>
        <Modal.Header>
          {t('login.title')}
        </Modal.Header>
        <Modal.Content>
          <p>{t('login.description')}</p>
          <span onClick={startOpenId} style={{ cursor: 'pointer' }}>
            <img alt={t('login.steam_login')} src={steamOpenId} />
          </span>
        </Modal.Content>
      </Modal>
    )
  }
}

LoginModal.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.object,
  setAccessToken: PropTypes.func.isRequired,
  setRefreshToken: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
  toggleLoginModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    open: state.views.openLoginModal,
    user: state.main.user
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    actions
  )(LoginModal)
)
