import React from 'react'
import PropTypes from 'prop-types'
import { Form, Modal, Select } from 'semantic-ui-react'
import { withTranslation } from '../i18n'
import { Currencies } from '../utils/enums'
import useSettings from './SettingsProvider'

const SettingsModal = ({ i18n, onClose, open, t }) => {
  if (!open) {
    return null
  }
  const { changeLanguage, language } = i18n
  const { currency, changeCurrency } = useSettings()

  return (
    <Modal open={open} onClose={onClose}>
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
            onChange={(_, { value }) => changeLanguage(value)}
          />
          <Form.Field
            control={Select}
            label={t('settings.currency.label')}
            options={[
              { key: 'usd', icon: 'usd', text: t('settings.currency.usd'), value: Currencies.usd },
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

SettingsModal.propTypes = {
  i18n: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

export default withTranslation('common')(SettingsModal)
