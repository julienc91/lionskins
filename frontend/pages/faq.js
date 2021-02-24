import React from 'react'
import Head from 'next/head'
import { Trans, useTranslation } from 'next-i18next'
import { Container, Header } from 'semantic-ui-react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Breadcrumb from '../components/Breadcrumb'
import LinkTrans from '../components/LinkTrans'

const Faq = () => {
  const { t } = useTranslation('faq')
  return (
    <Container className='page faq'>
      <Head>
        <title>{t('faq.page_title')}</title>
      </Head>

      <Breadcrumb items={[{ name: t('faq.breadcrumb') }]} />

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
        <p><Trans i18nKey='faq.part5.content' ns='faq'><LinkTrans href='/contact/'>-</LinkTrans></Trans></p>

      </Container>
    </Container>
  )
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...await serverSideTranslations(locale, ['common', 'faq'])
  }
})

export default Faq
