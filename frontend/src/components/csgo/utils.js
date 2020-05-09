import { Rarities } from './enums'
import { Providers } from '../enums'
import { Icon } from 'semantic-ui-react'
import React from 'react'

const getColorFromRarity = (rarity) => {
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

const getIconFromProvider = (provider) => {
  provider = Providers[provider]
  switch (provider) {
    case Providers.bitskins:
      return <i className='icon fontello bitskins' title={provider} />
    case Providers.csmoney:
      return <i className='icon fontello csmoney' title={provider} />
    case Providers.skinbaron:
      return <i className='icon fontello skinbaron' title={provider} />
    case Providers.steam:
      return <Icon name='steam symbol' title={provider} />
    default:
      return <Icon name='shop' title={provider} />
  }
}

const getSkinUrlFromProvider = (skin, provider) => {
  return `${process.env.REACT_APP_REDIRECT_DOMAIN}/redirect/${provider}/${skin.id}/`
}

export {
  getColorFromRarity,
  getIconFromProvider,
  getSkinUrlFromProvider
}
