import React, { useEffect } from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Card, Container, Header, Icon, Loader } from 'semantic-ui-react'
import useAuth from '../../components/AuthenticationProvider'
import Breadcrumb from '../../components/Breadcrumb'
import useSettings from '../../components/SettingsProvider'
import Skin from '../../components/csgo/Skin'
import AuthenticationManager from '../../utils/authentication'
import { Providers } from '../../utils/enums'
import steamOpenId from '../../assets/images/steam_openid.png'

export const getInventoryQuery = gql`
  query ($steamId: String, $currency: TypeCurrency) {
    inventory (steamId: $steamId) {
      edges {
        node {
          id
          name
          slug
          imageUrl
          statTrak
          quality
          rarity
          souvenir
          weapon {
            name
            category
          }
          type
          prices (currency: $currency) {
            bitskins
            csmoney
            skinbaron
            skinport
            steam
          }
        }
      }
    }
  }`

const MyInventory = () => {
  const { t } = useTranslation('csgo')
  const { user, loading: userLoading } = useAuth()
  const [loadInventory, { data, loading: dataLoading }] = useLazyQuery(getInventoryQuery, { notifyOnNetworkStatusChange: true })
  const { currency } = useSettings()

  const executeQuery = () => {
    if (!user || !user.steamId) {
      return
    }
    loadInventory({ variables: { currency, steamId: user.steamId } })
  }

  const handleStartLogin = AuthenticationManager.startOpenId

  useEffect(executeQuery, [user])
  useEffect(executeQuery, [currency])

  let minCost
  if (data && data.inventory.edges.length) {
    minCost = data.inventory.edges.map(({ node }) => (
      Math.min(...Object.keys(Providers).filter(provider => node.prices[provider]).map(provider => node.prices[provider]))
    )).reduce((a, b) => a + b)
  }

  return (
    <Container className='page inventory'>
      <Head>
        <title>{t('csgo.inventory.page_title')}</title>
      </Head>

      <Breadcrumb
        items={[
          { name: 'Counter-Strike: Global Offensive', link: '/counter-strike-global-offensive/' },
          { name: t('csgo.inventory.breadcrumb') }
        ]}
      />

      <Header as='h1' textAlign='center'>{t('csgo.inventory.title')}</Header>

      {(userLoading || dataLoading) && <Loader active inline='centered' key='loader' />}

      {!userLoading && !user && (
        <Header as='h2' icon textAlign='center'>
          <Icon name='steam symbol' />
          {t('csgo.inventory.sign_in_title')}
          <Header.Subheader>
            {t('csgo.inventory.sign_in_subtitle')}
          </Header.Subheader>
          <span onClick={handleStartLogin} style={{ cursor: 'pointer' }}>
            <img alt={t('csgo.inventory.steam_login')} src={steamOpenId} />
          </span>
        </Header>
      )}

      {!userLoading && user && !dataLoading && (
        <>
          {(!data || !data.inventory.edges.length)
            ? (
              <Header as='h2' icon textAlign='center'>
                <Icon name='frown outline' />
                {t('csgo.inventory.no_results_title')}
                <Header.Subheader>
                  {t('csgo.inventory.no_results_subtitle')}
                </Header.Subheader>
              </Header>
              )
            : (
              <>
                <Header as='h2' icon textAlign='center'>
                  <Icon name={currency} />
                  {t(`common:currency.${currency}`, { price: minCost })}<br />{t('csgo.inventory.summary_title')}
                  <Header.Subheader>
                    {t('csgo.inventory.summary_subtitle')}
                  </Header.Subheader>
                </Header>

                <div className='skin-list'>
                  <Card.Group className='item-list'>
                    {data.inventory.edges.map(({ node }) => <Skin key={node.id} skin={node} />)}
                    <div className='padding-item' />
                    <div className='padding-item' />
                    <div className='padding-item' />
                    <div className='padding-item' />
                    <div className='padding-item' />
                  </Card.Group>
                </div>
              </>
              )
            }
        </>
      )}

    </Container>
  )
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...await serverSideTranslations(locale, ['common', 'csgo'])
  }
})

export default MyInventory
