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
    const { toggleSettingsModal, user, unsetUser, t } = this.props
    return (
      <>
        <Menu.Item
          icon='setting'
          onClick={() => toggleSettingsModal(true)}
        />
        <Menu.Item>
          <Dropdown item text={<><Icon name='user' />{user.username}</>}>
            <Dropdown.Menu>
              <Dropdown.Item onClick={unsetUser}>
                <Icon name='log out' />{t('header.logout')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>
      </>
    )
  }

  renderVisitorMenu () {
    const { toggleLoginModal, toggleSettingsModal } = this.props
    return (
      <>
        <Menu.Item
          icon='setting'
          onClick={() => toggleSettingsModal(true)}
        />
        <Menu.Item
          icon='user'
          onClick={() => toggleLoginModal(true)}
        />
      </>
    )
  }

  render () {
    const { user } = this.props
    return (
      <Menu as='nav' inverted>
        <Menu.Item>
          <Link to='/'><img src={logo} alt='LionSkins' /></Link>
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
  toggleLoginModal: PropTypes.func.isRequired,
  toggleSettingsModal: PropTypes.func.isRequired,
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
