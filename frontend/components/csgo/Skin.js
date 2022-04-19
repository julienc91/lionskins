import React from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import PropTypes from 'prop-types'
import { Card, Label } from 'semantic-ui-react'
import Image from '../Image'
import MarketplaceLink from '../MarketplaceLink'
import { Providers } from '../../utils/enums'
import { Qualities, Weapons } from '../../utils/csgo/enums'
import { getColorFromRarity, getIconFromProvider, getSkinInternalUrl, getSkinUrlFromProvider } from '../../utils/csgo/utils'
import { formatPrice } from '../../utils/i18n'

const Skin = ({ skin }) => {
  const { t, lang } = useTranslation('csgo')
  const internalUrl = getSkinInternalUrl(skin)
  let skinName
  let defaultImage
  if (skin.type !== 'weapons') {
    skinName = skin.name
    defaultImage = skin.type
  } else {
    skinName = t(Weapons[skin.weapon.name]) + ' - '
    skinName += (skin.slug === 'vanilla') ? t('csgo.qualities.vanilla') : skin.name
    defaultImage = skin.weapon.name
  }

  return (
    <Card color={getColorFromRarity(skin.rarity)} className='skin item'>
      <Link href={internalUrl}>
        <a>
          <Image
            alt={skinName}
            imageSrc={skin.imageUrl}
            loaderSrc={`/images/csgo/weapons/default_skin_${defaultImage}.png`}
            className='ui image'
          />
        </a>
      </Link>
      {skin.statTrak && (
        <Label className='stattrak' color='orange'>{t('csgo.skin.stat_trak')}</Label>
      )}
      {skin.souvenir && (
        <Label className='souvenir' color='yellow'>{t('csgo.skin.souvenir')}</Label>
      )}
      <Card.Content>
        <Card.Header>
          <Link href={internalUrl}><a>{skinName}</a></Link>
        </Card.Header>
        <Card.Meta>
          {skin.quality ? t(Qualities[skin.quality]) : ''}
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <div className='prices'>
          {Object.keys(Providers).sort().map(provider => {
            if (!skin || !skin.prices || !skin.prices[provider]) {
              return null
            }
            return (
              <div className='price' key={provider}>
                <MarketplaceLink href={getSkinUrlFromProvider(skin, provider)}>
                  {getIconFromProvider(provider)}
                  {formatPrice(skin.prices[provider], lang)}
                </MarketplaceLink>
              </div>
            )
          })}
        </div>
      </Card.Content>
    </Card>
  )
}

Skin.propTypes = {
  skin: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    quality: PropTypes.string,
    rarity: PropTypes.string,
    statTrak: PropTypes.bool,
    souvenir: PropTypes.bool,
    type: PropTypes.string.isRequired,
    weapon: PropTypes.shape({
      name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired
    }),
    prices: PropTypes.shape({
      bitskins: PropTypes.number,
      csmoney: PropTypes.number,
      skinbaron: PropTypes.number,
      skinport: PropTypes.number,
      steam: PropTypes.number
    })
  })
}

export default Skin
