import React from 'react'
import useTranslation from 'next-translate/useTranslation'
import PropTypes from 'prop-types'
import { Modal } from 'semantic-ui-react'
import AuthencationManager from '../utils/authentication'

const LoginModal = ({ onClose, open }) => {
  const { t } = useTranslation('common')
  const handleStartLogin = AuthencationManager.startOpenId

  if (!open) {
    return null
  }
  return (
    <Modal open={open} onClose={onClose} className='login-modal'>
      <Modal.Header>
        {t('login.title')}
      </Modal.Header>
      <Modal.Content>
        <p>{t('login.description')}</p>
        <span onClick={handleStartLogin} style={{ cursor: 'pointer' }}>
          <img alt={t('login.steam_login')} src='/images/steam_openid.png' />
        </span>
      </Modal.Content>
    </Modal>
  )
}

LoginModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}

export default LoginModal
