import React from 'react'
import Head from 'next/head'
import useTranslation from 'next-translate/useTranslation'
import Trans from 'next-translate/Trans'
import { Container, Header } from 'semantic-ui-react'
import Breadcrumb from '../components/Breadcrumb'
import LinkTrans from '../components/LinkTrans'

const PrivacyPolicy = () => {
  const { t } = useTranslation('privacy_policy')
  return (
    <Container className='page privacy-policy'>
      <Head>
        <title>{t('privacy_policy.page_title')}</title>
      </Head>

      <Breadcrumb items={[{ name: t('privacy_policy.breadcrumb') }]} />

      <Header as='h1' textAlign='center'>
        {t('privacy_policy.title')}
        <Header.Subheader>{t('privacy_policy.subtitle')}</Header.Subheader>
      </Header>

      <Container>

        <Header as='h2'>{t('privacy_policy.part1.title')}</Header>
        <p>{t('privacy_policy.part1.content1')}</p>
        <p><Trans i18nKey='privacy_policy:privacy_policy.part1.content2' components={[<LinkTrans key={0} href='/contact/' />]} />
        </p>

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
            <a
              href='https://store.steampowered.com/' target='_blank'
              rel='noopener noreferrer'
            >
              {t('privacy_policy.part3.item1.name')}
            </a>
            {t('privacy_policy.part3.item1.description')}
          </li>
          <li>
            <a href='https://matomo.org/' target='_blank' rel='noopener noreferrer'>{t('privacy_policy.part3.item2.name')}</a>
            {t('privacy_policy.part3.item2.description')}
          </li>
          <li>
            <a href='https://sentry.io/' target='_blank' rel='noopener noreferrer'>{t('privacy_policy.part3.item3.name')}</a>
            {t('privacy_policy.part3.item3.description')}
          </li>
          <li>
            <a
              href='https://www.google.com/recaptcha/' target='_blank'
              rel='noopener noreferrer'
            >
              {t('privacy_policy.part3.item4.name')}
            </a>
            {t('privacy_policy.part3.item4.description')}
          </li>
        </ul>

      </Container>
    </Container>
  )
}

export default PrivacyPolicy
