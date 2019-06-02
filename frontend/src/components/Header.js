import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import moment from 'moment'
import 'moment/locale/fr'
import { Dropdown, Icon, Image, Menu } from 'semantic-ui-react'
import * as actions from '../actions'
import i18n from '../i18n'
import { Currencies } from './enums'
import PropTypes from 'prop-types'

import logo from '../assets/images/logo.svg'
import csgoLogo from '../assets/images/csgo.svg'
import englishIcon from '../assets/images/english.png'
import frenchIcon from '../assets/images/french.png'
import eurIcon from '../assets/images/eur.png'
import usdIcon from '../assets/images/usd.png'

class Header extends Component {
  static changeLanguage (language) {
    i18n.changeLanguage(language)
    moment.locale(language)
  }

  changeCurrency (currency) {
    const { changeCurrency } = this.props
    changeCurrency(currency)
  }

  render () {
    const { t } = this.props
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
        <Menu.Menu position='right' className='menu-settings'>
          <Icon name='setting' />
          <Dropdown item text={t('header.settings.menu')}>
            <Dropdown.Menu>
              <Dropdown.Header>{t('header.settings.language')}</Dropdown.Header>
              <Dropdown.Item onClick={() => Header.changeLanguage('en')}>
                <Image src={englishIcon} inline size='mini' />
                {t('header.settings.language_en')}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => Header.changeLanguage('fr')}>
                <Image src={frenchIcon} inline size='mini' />
                {t('header.settings.language_fr')}
              </Dropdown.Item>
              <Dropdown.Header>{t('header.settings.currency')}</Dropdown.Header>
              <Dropdown.Item onClick={() => this.changeCurrency(Currencies.usd)}>
                <Image src={usdIcon} inline size='mini' />
                {t('header.settings.currency_usd')}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => this.changeCurrency(Currencies.eur)}>
                <Image src={eurIcon} inline size='mini' />
                {t('header.settings.currency_eur')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Menu>
      </Menu>
    )
  }
}

Header.propTypes = {
  t: PropTypes.func.isRequired,
  changeCurrency: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {}
}

export default withRouter(
  withTranslation()(
    connect(
      mapStateToProps,
      actions
    )(Header)
  )
)
