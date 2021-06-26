import React from 'react'
import { gql, useQuery } from '@apollo/client'
import Head from 'next/head'
import useTranslation from 'next-translate/useTranslation'
import PropTypes from 'prop-types'
import { Container, Header, Loader } from 'semantic-ui-react'
import Page404 from '../../404'
import Breadcrumb from '../../../components/Breadcrumb'
import useSettings from '../../../components/SettingsProvider'
import SkinSummary from '../../../components/csgo/SkinSummary'
import SkinPrices from '../../../components/csgo/SkinPrices'
import { Providers } from '../../../utils/enums'
import Image from '../../../components/Image'

const getSkinQuery = gql`
  query ($weapon: CSGOWeapons, $slug: String, $currency: TypeCurrency, $category: CSGOCategories, $type: CSGOTypes,
         $quality: CSGOQualities, $rarity: CSGORarities, $statTrak: Boolean, $souvenir: Boolean,
         $search: String) {
    csgo (weapon: $weapon, slug: $slug, category: $category, type: $type, quality: $quality, rarity: $rarity,
          statTrak: $statTrak, souvenir: $souvenir, search: $search) {
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
          collection
          description {
            en
            fr
          }
          type
          weapon {
            name
            category
          }
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

const SkinPage = ({ slug }) => {
  const { t } = useTranslation('csgo')
  const { currency } = useSettings()
  const { data, loading } = useQuery(getSkinQuery, { variables: { currency, type: 'agents', slug }, notifyOnNetworkStatusChange: true })

  if (!loading && (!data || !data.csgo.edges.length)) {
    return <Page404 />
  } else if (loading) {
    return (
      <Container>
        <Loader active inline='centered' key='loader' />
      </Container>
    )
  }

  const skins = data.csgo.edges.map(({ node }) => node)
  const skin = skins[0]
  const description = skin.description[t('common:current_language')]
  const defaultImage = '/images/csgo/weapons/default_skin_agent.png'
  const image = skin.imageUrl || defaultImage

  const allPrices = []
  skins.forEach(skin => {
    Object.keys(Providers).forEach(provider => {
      if (skin.prices && skin.prices[provider]) {
        allPrices.push(skin.prices[provider])
      }
    })
  })

  return (
    <Container className='skin-page'>
      <Head>
        <title>{`${t('csgo.skin.page_title')} - ${skin.name}`}</title>
      </Head>

      <Breadcrumb items={[
        { name: 'Counter-Strike: Global Offensive', link: '/counter-strike-global-offensive/' },
        { name: t('csgo.types.agents') },
        { name: skin.name }
      ]}
      />
      <Header as='h1'>{skin.name}</Header>

      <div className='main-content'>

        <div className='description'>{description}</div>

        <div className='panels'>
          <section className='left-panel'>

            <Header as='h3' key='header'>{t('csgo.skin.summary')}</Header>
            <SkinSummary skins={skins} />

            <div className='skin-image'>
              <Image
                alt={skin.name}
                imageSrc={image}
                loaderSrc={defaultImage}
              />
            </div>
          </section>

          <section className='right-panel'>
            <div className='skin-prices'>
              <Header as='h3'>{t('csgo.skin.prices')}</Header>
              <SkinPrices skins={skins} statTrak={false} souvenir={false} />
            </div>
          </section>
        </div>
      </div>

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: skin.name,
            image,
            description,
            offers: {
              '@type': 'AggregateOffer',
              offerCount: allPrices.length,
              lowPrice: Math.min(...allPrices),
              highPrice: Math.max(...allPrices),
              priceCurrency: currency
            }
          })
        }}
      />

    </Container>
  )
}

SkinPage.propTypes = {
  slug: PropTypes.string.isRequired
}

export const getServerSideProps = async ({ query }) => {
  const slug = query.slug

  if (!slug) {
    return { notFound: true }
  }

  return {
    props: {
      slug
    }
  }
}

export default SkinPage
