import React from 'react'
import { Icon } from 'semantic-ui-react'
import slugify from 'slugify'
import { Rarities } from './enums'
import { Providers } from '../enums'

const getColorFromRarity = rarity => {
  rarity = Rarities[rarity]
  switch (rarity) {
    case Rarities.consumer_grade:
      return 'grey'
    case Rarities.industrial_grade:
      return 'teal'
    case Rarities.mil_spec:
      return 'blue'
    case Rarities.restricted:
      return 'purple'
    case Rarities.classified:
      return 'pink'
    case Rarities.covert:
      return 'red'
    case Rarities.contraband:
      return 'orange'
    default:
      return 'black'
  }
}

const getIconFromProvider = provider => {
  provider = Providers[provider]
  switch (provider) {
    case Providers.bitskins:
      return <i className='icon fontello bitskins' title={provider} />
    case Providers.csmoney:
      return <i className='icon fontello csmoney' title={provider} />
    case Providers.skinbaron:
      return <i className='icon fontello skinbaron' title={provider} />
    case Providers.skinport:
      return <i className='icon fontello skinport' title={provider} />
    case Providers.steam:
      return <Icon name='steam symbol' title={provider} />
    default:
      return <Icon name='shop' title={provider} />
  }
}

const getSkinInternalUrl = skin => {
  let weaponSlug
  if (['agents', 'music_kits', 'graffitis', 'stickers'].indexOf(skin.type) >= 0) {
    weaponSlug = skin.type.replace('_', '-')
  } else {
    weaponSlug = getWeaponSlug(skin.weapon.name)
  }
  return `/counter-strike-global-offensive/${weaponSlug}/${skin.slug}/`
}

const getWeaponSlug = weaponName => {
  return slugify(weaponName.replace('_', '-'), { lower: true })
}

const getSkinUrlFromProvider = (skin, provider) => {
  return `${process.env.NEXT_PUBLIC_REDIRECT_DOMAIN}/redirect/${provider}/${skin.id}/`
}

export {
  getColorFromRarity,
  getIconFromProvider,
  getSkinInternalUrl,
  getSkinUrlFromProvider,
  getWeaponSlug
}
