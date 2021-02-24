import React from 'react'
import Head from 'next/head'
import { Trans, useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Container, Header } from 'semantic-ui-react'
import Breadcrumb from '../components/Breadcrumb'
import LinkTrans from '../components/LinkTrans'

const About = () => {
  const { t } = useTranslation('about')
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

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...await serverSideTranslations(locale, ['common', 'about'])
  }
})

export default About
