import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Dropdown, Icon, Menu } from 'semantic-ui-react'
import * as actions from '../actions'
import PropTypes from 'prop-types'

import logo from '../assets/images/logo.svg'
import csgoLogo from '../assets/images/csgo.svg'

class Header extends Component {
  renderUserMenu () {
    const { toggleListManagementModal, toggleSettingsModal, user, unsetUser, t } = this.props
    return (
      <Menu.Item>
        <Dropdown item text={<><Icon name='user' />{user.username}</>}>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => toggleListManagementModal(true)}>
              <Icon name='list' />{t('header.list_management')}
            </Dropdown.Item>
            <Dropdown.Item onClick={() => toggleSettingsModal(true)}>
              <Icon name='setting' />{t('header.settings')}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={unsetUser}>
              <Icon name='log out' />{t('header.logout')}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Item>
    )
  }

  renderVisitorMenu () {
    const { toggleLoginModal, toggleSettingsModal, toggleSignupModal, t } = this.props
    return (
      <Menu.Item>
        <Dropdown item text={<Icon name='user' />}>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => toggleLoginModal(true)}>
              <Icon name='sign in' />{t('header.login')}
            </Dropdown.Item>
            <Dropdown.Item onClick={() => toggleSignupModal(true)}>
              <Icon name='signup' />{t('header.signup')}
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={() => toggleSettingsModal(true)}>
              <Icon name='setting' />{t('header.settings')}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Item>
    )
  }

  render () {
    const { user } = this.props
    return (
      <Menu as='nav' inverted>
        <Menu.Item>
          <Link to='/'><img src={logo} alt='Lion Skins' /></Link>
        </Menu.Item>
        <Menu.Item>
          <Link to='/counter-strike-global-offensive/'>
            <img src={csgoLogo} alt='Counter-Strike: Global Offensive' />
          </Link>
        </Menu.Item>
        <Menu.Menu position='right' className='menu-settings'>
          {user ? this.renderUserMenu() : this.renderVisitorMenu()}
        </Menu.Menu>
      </Menu>
    )
  }
}

Header.propTypes = {
  t: PropTypes.func.isRequired,
  toggleListManagementModal: PropTypes.func.isRequired,
  toggleLoginModal: PropTypes.func.isRequired,
  toggleSettingsModal: PropTypes.func.isRequired,
  toggleSignupModal: PropTypes.func.isRequired,
  user: PropTypes.object,
  unsetUser: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    user: state.main.user
  }
}

export default withRouter(
  withTranslation()(
    connect(
      mapStateToProps,
      actions
    )(Header)
  )
)
