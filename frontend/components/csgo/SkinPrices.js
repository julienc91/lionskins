import React from 'react'
import useTranslation from 'next-translate/useTranslation'
import PropTypes from 'prop-types'
import { Table } from 'semantic-ui-react'
import TrackedLink from '../TrackedLink'
import { Providers } from '../../utils/enums'
import { Qualities } from '../../utils/csgo/enums'
import { getIconFromProvider, getSkinUrlFromProvider } from '../../utils/csgo/utils'
import { formatPrice } from '../../utils/i18n'

const SkinPrices = ({ skins, souvenir, statTrak }) => {
  const { t, lang } = useTranslation('csgo')

  const skin = skins[0]
  const isMusicKit = skin.type === 'music_kits'
  const isWeapon = skin.type === 'weapons'

  let qualities
  if (!isWeapon) {
    qualities = ['default']
  } else if (skin.quality === 'vanilla') {
    qualities = ['vanilla']
  } else {
    qualities = Object.keys(Qualities).filter(quality => quality !== 'vanilla')
  }

  return (
    <Table unstackable celled singleLine textAlign='center'>
      <Table.Header>
        <Table.Row>
          {isWeapon && <Table.HeaderCell>{t('csgo.skin.quality')}</Table.HeaderCell>}
          {Object.keys(Providers).map(provider =>
            <Table.HeaderCell key={provider}>
              {getIconFromProvider(provider)}
              {Providers[provider]}
            </Table.HeaderCell>
          )}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {qualities.map(quality => {
          let skin
          if (!isWeapon && !isMusicKit) {
            skin = skins[0]
          } else if (isMusicKit) {
            skin = skins.find(skin => skin.statTrak === statTrak)
          } else {
            skin = skins.find(
              skin => skin.statTrak === statTrak &&
                skin.souvenir === souvenir &&
                skin.quality === quality
            )
          }
          const prices = skin ? skin.prices : []
          const flatPrices = Object.keys(Providers).filter(provider => prices[provider]).map(provider => prices[provider])
          const minPrice = Math.min(...flatPrices)
          const maxPrice = Math.max(...flatPrices)

          return (
            <Table.Row key={quality}>
              {isWeapon && <Table.Cell>{t(Qualities[quality])}</Table.Cell>}
              {Object.keys(Providers).map(provider => {
                const price = prices[provider]
                const url = skin ? getSkinUrlFromProvider(skin, provider) : ''

                return (
                  <Table.Cell
                    key={provider}
                    positive={price && price === minPrice}
                    negative={price && minPrice < maxPrice && price === maxPrice}
                  >
                    {price
                      ? <TrackedLink href={url}>{formatPrice(price, lang)}</TrackedLink>
                      : ''}
                  </Table.Cell>
                )
              })}
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}

SkinPrices.propTypes = {
  skins: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      quality: PropTypes.string,
      statTrak: PropTypes.bool,
      souvenir: PropTypes.bool,
      prices: PropTypes.shape({
        bitskins: PropTypes.number,
        csmoney: PropTypes.number,
        skinbaron: PropTypes.number,
        skinport: PropTypes.number,
        steam: PropTypes.number
      }),
      type: PropTypes.string.isRequired,
      weapon: PropTypes.shape({
        name: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired
      })
    })
  ).isRequired,
  statTrak: PropTypes.bool.isRequired,
  souvenir: PropTypes.bool.isRequired
}

export default SkinPrices
