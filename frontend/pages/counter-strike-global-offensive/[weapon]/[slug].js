import React, { useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { Container, Header, Loader } from 'semantic-ui-react'
import Page404 from '../../404'
import Breadcrumb from '../../../components/Breadcrumb'
import useSettings from '../../../components/SettingsProvider'
import SkinSummary from '../../../components/csgo/SkinSummary'
import SkinPrices from '../../../components/csgo/SkinPrices'
import { withTranslation } from '../../../i18n'
import { getWeaponSlug } from '../../../utils/csgo/utils'
import { Qualities, Weapons } from '../../../utils/csgo/enums'
import Image from '../../../components/Image'

const getSkinQuery = gql`
  query ($weapon: CSGOWeapons, $slug: String, $currency: TypeCurrency, $category: CSGOCategories,
         $quality: CSGOQualities, $rarity: CSGORarities, $statTrak: Boolean, $souvenir: Boolean,
         $search: String) {
    csgo (weapon: $weapon, slug: $slug, category: $category, quality: $quality, rarity: $rarity, statTrak: $statTrak, souvenir: $souvenir, search: $search) {
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
          weapon {
            name
            category
          }
          prices {
            price (currency: $currency)
            provider
          }
        }
      }
    }
  }`

const SkinPage = ({ slug, t, weapon }) => {
  const { currency } = useSettings()
  const { data, loading } = useQuery(getSkinQuery, { variables: { currency, weapon, slug }, notifyOnNetworkStatusChange: true })
  const [quality, setQuality] = useState(Object.keys(Qualities)[0])

  if ((!weapon || !slug) || (!loading && (!data || !data.csgo.edges.length))) {
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
  const weaponName = t(Weapons[skin.weapon.name])
  const description = t(skin.description[t('common:current_language')])
  const skinName = skin.quality === 'vanilla' ? t('csgo.qualities.vanilla') : skin.name
  const hasStatTrak = skins.some(s => s.statTrak)
  const hasSouvenir = skins.some(s => s.souvenir)

  let qualities
  if (skin.quality === 'vanilla') {
    qualities = ['vanilla']
  } else {
    qualities = Object.keys(Qualities).filter(q => q !== 'vanilla')
  }

  const defaultSkin = skins.find(s => s.quality === quality && s.imageUrl)
  const defaultImage = `/images/csgo/weapons/default_skin_${skin.weapon.name}.png`
  const image = (defaultSkin && defaultSkin.imageUrl) ? defaultSkin.imageUrl : defaultImage

  return (
    <Container className='skin-page'>
      <Head>
        <title>{`${t('csgo.skin.page_title')} - ${t(Weapons[skin.weapon.name])} - ${skinName}`}</title>
      </Head>

      <Breadcrumb items={[
        { name: 'Counter-Strike: Global Offensive', link: '/counter-strike-global-offensive/' },
        { name: t(Weapons[skin.weapon.name]) },
        { name: skin.quality === 'vanilla' ? t('csgo.qualities.vanilla') : skin.name }
      ]}
      />
      <Header as='h1'>{weaponName} - {skinName}</Header>

      <div className='main-content'>

        <div>{description}</div>

        <div className='panels'>
          <section className='left-panel'>

            <Header as='h3' key='header'>{t('csgo.skin.summary')}</Header>
            <SkinSummary skins={skins} />

            <div className='skin-image'>
              <Image
                alt={`${weaponName} - ${skinName}`}
                imageSrc={image}
                loaderSrc={defaultImage}
              />
            </div>

            <div className='select-quality'>
              {qualities.map(key => (
                <div
                  key={key}
                  className={quality === key ? 'active' : ''}
                  onClick={() => setQuality(key)}
                >
                  {t(Qualities[key])}
                </div>
              ))}
            </div>
          </section>

          <section className='right-panel'>
            <div className='skin-prices'>
              <Header as='h3'>{t('csgo.skin.vanilla')}</Header>
              <SkinPrices skins={skins} statTrak={false} souvenir={false} />

              {hasStatTrak && [
                <Header as='h3' key='header'>{t('csgo.skin.stat_trak')}</Header>,
                <SkinPrices skins={skins} statTrak souvenir={false} key='prices' />
              ]}
              {hasSouvenir && [
                <Header as='h3' key='header'>{t('csgo.skin.souvenir')}</Header>,
                <SkinPrices skins={skins} statTrak={false} souvenir key='prices' />
              ]}
            </div>
          </section>
        </div>
      </div>

      <script type='application/ld+json'>
        {JSON.stringify({
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: `${weaponName} - ${skinName}`,
          image,
          description,
          offers: {
            '@type': 'AggregateOffer',
            offerCount: skins.map(skin => skin.prices.length).reduce((a, b) => a + b),
            lowPrice: skins.map(skin => skin.prices).flat().map(price => price.price).sort((a, b) => a - b).shift(),
            highPrice: skins.map(skin => skin.prices).flat().map(price => price.price).sort((a, b) => a - b).pop(),
            priceCurrency: currency
          }
        })}
      </script>

    </Container>
  )
}

SkinPage.propTypes = {
  slug: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  weapon: PropTypes.string.isRequired
}

export const getServerSideProps = async ({ query, res }) => {
  const slug = query.slug
  const weapon = Object.keys(Weapons).find(e => getWeaponSlug(e) === query.weapon)
  const props = {}

  if (!weapon) {
    res.statusCode = 404
  } else {
    props.weapon = weapon
    props.slug = slug
  }

  return { props }
}

export default withTranslation(['csgo', 'common'])(SkinPage)
