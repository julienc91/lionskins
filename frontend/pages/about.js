import React from 'react'
import Head from 'next/head'
import { Container, Header } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { Trans, withTranslation } from '../i18n'
import Breadcrumb from '../components/Breadcrumb'
import LinkTrans from '../components/LinkTrans'

const About = ({ t }) => {
  return (
    <Container className='page about'>
      <Head>
        <title>{t('about.page_title')}</title>
      </Head>

      <Breadcrumb items={[{ name: t('about.breadcrumb') }]} />

      <Header as='h1' textAlign='center'>
        {t('about.title')}
        <Header.Subheader>{t('about.subtitle')}</Header.Subheader>
      </Header>

      <Container>

        <Header as='h2'>{t('about.part1.title')}</Header>

        <p>{t('about.part1.content1')}</p>
        <p>{t('about.part1.content2')}</p>
        <p>{t('about.part1.content3')}</p>
        <p><Trans i18nKey='about.part1.content4' ns='about'><LinkTrans href='/contact/'>-</LinkTrans></Trans></p>

      </Container>
    </Container>
  )
}

About.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation('about')(About)
