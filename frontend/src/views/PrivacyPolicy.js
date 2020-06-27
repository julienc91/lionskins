import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { Trans, withTranslation } from 'react-i18next'
import { Container, Header } from 'semantic-ui-react'
import Breadcrumb from '../components/tools/Breadcrumb'
import PropTypes from 'prop-types'

class PrivacyPolicy extends Component {
  render () {
    const { t } = this.props
    return (
      <Container className='page privacy-policy'>
        <Helmet
          title={t('privacy_policy.page_title')}
        />

        <Breadcrumb items={[{ name: t('privacy_policy.breadcrumb') }]} />

        <Header as='h1' textAlign='center'>
          {t('privacy_policy.title')}
          <Header.Subheader>{t('privacy_policy.subtitle')}</Header.Subheader>
        </Header>

        <Container>

          <Header as='h2'>{t('privacy_policy.part1.title')}</Header>
          <p>{t('privacy_policy.part1.content1')}</p>
          <p><Trans i18nKey='privacy_policy.part1.content2'><Link to='/contact/'>-</Link></Trans></p>

          <Header as='h2'>{t('privacy_policy.part2.title')}</Header>
          <p>{t('privacy_policy.part2.content1')}</p>

          <ul>
            <li>
              <strong>{t('privacy_policy.part2.item1.name')}</strong>
              {t('privacy_policy.part2.item1.description')}
            </li>
            <li>
              <strong>{t('privacy_policy.part2.item2.name')}</strong>
              {t('privacy_policy.part2.item2.description')}
            </li>
            <li>
              <strong>{t('privacy_policy.part2.item3.name')}</strong>
              {t('privacy_policy.part2.item3.description')}
            </li>
          </ul>

          <Header as='h2'>{t('privacy_policy.part3.title')}</Header>
          <p>{t('privacy_policy.part3.content1')}</p>

          <ul>
            <li>
              <a href='https://store.steampowered.com/' target='_blank' rel='noopener noreferrer'>{t('privacy_policy.part3.item1.name')}</a>
              {t('privacy_policy.part3.item1.description')}
            </li>
            <li>
              <a href='https://matomo.org/' target='_blank' rel='noopener noreferrer'>{t('privacy_policy.part3.item2.name')}</a>
              {t('privacy_policy.part3.item2.description')}
            </li>
            <li>
              <a href='https://www.google.com/recaptcha/' target='_blank' rel='noopener noreferrer'>{t('privacy_policy.part3.item3.name')}</a>
              {t('privacy_policy.part3.item3.description')}
            </li>
          </ul>

        </Container>
      </Container>
    )
  }
}

PrivacyPolicy.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(PrivacyPolicy)
