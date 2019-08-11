import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { Form, Modal, Select } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import * as actions from '../../actions'
import { Currencies } from '../../components/enums'
import i18n from '../../i18n'

class SettingsModal extends Component {
  render () {
    const { currency, changeCurrency, changeLanguage, open, toggleSettingsModal, t } = this.props
    let { language } = i18n || 'en'
    if (language) {
      language = language.slice(0, 2)
    }
    return (
      <Modal open={open} onClose={() => toggleSettingsModal(false)}>
        <Modal.Header>
          {t('settings.title')}
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field
              control={Select}
              label={t('settings.language.label')}
              options={[
                { key: 'en', flag: 'gb', text: t('settings.language.en'), value: 'en' },
                { key: 'fr', flag: 'fr', text: t('settings.language.fr'), value: 'fr' }
              ]}
              value={language}
              onChange={(e, { value }) => changeLanguage(value)}
            />
            <Form.Field
              control={Select}
              label={t('settings.currency.label')}
              options={[
                { key: 'usd', icon: 'usd sign', text: t('settings.currency.usd'), value: Currencies.usd },
                { key: 'eur', icon: 'euro sign', text: t('settings.currency.eur'), value: Currencies.eur }
              ]}
              value={currency}
              onChange={(e, { value }) => changeCurrency(value)}
            />
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}

SettingsModal.propTypes = {
  currency: PropTypes.string.isRequired,
  changeCurrency: PropTypes.func.isRequired,
  changeLanguage: PropTypes.func.isRequired,
  toggleSettingsModal: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    open: state.views.openSettingsModal,
    currency: state.main.currency,
    language: state.main.currency
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    actions
  )(SettingsModal)
)
