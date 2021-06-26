import React from 'react'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Container, Header, Icon, Button } from 'semantic-ui-react'
import nextI18NextConfig from '../next-i18next.config'

const Page404 = () => {
  const { t } = useTranslation()
  return (
    <Container>
      <Header as='h1' icon className='no-results'>
        <Icon name='frown outline' />
        {t('404.title')}
        <Header.Subheader>{t('404.subtitle')}</Header.Subheader>
        <Header.Subheader>
          <Link href='/'>
            <Button primary>
              {t('404.homepage')}
            </Button>
          </Link>
        </Header.Subheader>
      </Header>
    </Container>
  )
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'], nextI18NextConfig))
  }
})

export default Page404
