import React from 'react'
import { useTranslation } from 'next-i18next'
import PropTypes from 'prop-types'
import { Table } from 'semantic-ui-react'
import useSettings from '../SettingsProvider'
import TrackedLink from '../TrackedLink'
import { Providers } from '../../utils/enums'
import { Qualities } from '../../utils/csgo/enums'
import { getIconFromProvider, getSkinUrlFromProvider } from '../../utils/csgo/utils'

const SkinPrices = ({ skins, souvenir, statTrak }) => {
  const { t } = useTranslation('csgo')
  const { currency } = useSettings()

  const skin = skins[0]
  const isAgent = skin.type === 'agents'

  let qualities
  if (isAgent) {
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
          {!isAgent && <Table.HeaderCell>{t('csgo.skin.quality')}</Table.HeaderCell>}
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
          if (isAgent) {
            skin = skins[0]
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
              {!isAgent && <Table.Cell>{t(Qualities[quality])}</Table.Cell>}
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
                      ? <TrackedLink href={url}>{t(`common:currency.${currency}`, { price })}</TrackedLink>
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
