import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { Menu } from 'semantic-ui-react'
import logo from '../assets/images/logo.svg'
import csgoLogo from '../assets/images/csgo.svg'

class Header extends Component {
  render () {
    return (
      <Menu as={'nav'} inverted>
        <Menu.Item>
          <Link to='/'><img src={logo} alt='Lion Skins' /></Link>
        </Menu.Item>
        <Menu.Item>
          <Link to='/counter-strike-global-offensive/'>
            <img src={csgoLogo} alt='Counter-Strike: Global Offensive' />
          </Link>
        </Menu.Item>
      </Menu>
    )
  }
}

export default withRouter(Header)
