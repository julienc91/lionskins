import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { Trans, withTranslation } from 'react-i18next'
import { Container, Header } from 'semantic-ui-react'
import Breadcrumb from '../components/tools/Breadcrumb'
import PropTypes from 'prop-types'

class Faq extends Component {
  render () {
    const { t } = this.props
    return (
      <Container className='page faq'>
        <Helmet
          title={t('faq.page_title')}
        />

        <Breadcrumb items={[{ 'name': t('faq.breadcrumb') }]} />

        <Header as='h1' textAlign='center'>
          {t('faq.title')}
          <Header.Subheader>{t('faq.subtitle')}</Header.Subheader>
        </Header>

        <Container>

          <Header as='h2'>{t('faq.part1.title')}</Header>
          <p>{t('faq.part1.content')}</p>

          <Header as='h2'>{t('faq.part2.title')}</Header>
          <p>{t('faq.part2.content')}</p>

          <Header as='h2'>{t('faq.part3.title')}</Header>
          <p>{t('faq.part3.content')}</p>

          <Header as='h2'>{t('faq.part4.title')}</Header>
          <p>{t('faq.part4.content')}</p>

          <Header as='h2'>{t('faq.part5.title')}</Header>
          <p><Trans i18nKey='faq.part5.content'>-<Link to='/contact/'>-</Link>.</Trans></p>

        </Container>
      </Container>
    )
  }
}

Faq.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(Faq)
