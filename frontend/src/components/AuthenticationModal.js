import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { Modal, Tab } from 'semantic-ui-react'
import * as actions from '../actions'
import i18n from '../i18n'
import PropTypes from 'prop-types'

class AuthenticationModal extends Component {
  constructor (props) {
    super(props)
    this.renderSignInTab = this.renderSignInTab.bind(this)
    this.renderSignUpTab = this.renderSignUpTab.bind(this)
  }

  renderSignInTab () {
    const { t } = this.props
    return (
      <div>
        <Modal.Header>{t('authentication')}</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <p>We've found the following gravatar image associated with your e-mail address.</p>
            <p>Is it okay to use this photo?</p>
          </Modal.Description>
        </Modal.Content>
      </div>
    )
  }

  renderSignUpTab () {
    const { t } = this.props
    return (
      <div>
        <Modal.Header>{t('authentication')}</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <p>We've found the following gravatar image associated with your e-mail address.</p>
            <p>Is it okay to use this photo?</p>
          </Modal.Description>
        </Modal.Content>
      </div>
    )
  }

  render () {
    const { t } = this.props
    const tabs = [
      { menuItem: t('authentication.signup_tab'), render: this.renderSignUpTab },
      { menuItem: t('authentication.signin_tab'), render: this.renderSignInTab }
    ]

    return (
      <Modal defaultOpen centered={false}>
        <Tab panes={tabs} />
      </Modal>
    )
  }
}

AuthenticationModal.propTypes = {
  t: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {}
}

export default withTranslation()(
  connect(
    mapStateToProps,
    actions
  )(AuthenticationModal)
)
