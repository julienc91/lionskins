import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'semantic-ui-react'
import useSettings from '../SettingsProvider'
import TrackedLink from '../TrackedLink'
import { withTranslation } from '../../i18n'
import { Providers } from '../../utils/enums'
import { Qualities } from '../../utils/csgo/enums'
import { getIconFromProvider, getSkinUrlFromProvider } from '../../utils/csgo/utils'

const SkinPrices = ({ skins, souvenir, statTrak, t }) => {
  const { currency } = useSettings()

  const skin = skins[0]

  let qualities
  if (skin.quality === 'vanilla') {
    qualities = ['vanilla']
  } else {
    qualities = Object.keys(Qualities).filter(quality => quality !== 'vanilla')
  }

  return (
    <Table unstackable celled singleLine textAlign='center'>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>{t('csgo.skin.quality')}</Table.HeaderCell>
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
          const skin = skins.find(
            skin => skin.statTrak === statTrak &&
            skin.souvenir === souvenir &&
            skin.quality === quality
          )
          const prices = skin ? skin.prices : []
          const minPrice = Math.min(...prices.map(price => price.price))
          const maxPrice = Math.max(...prices.map(price => price.price))

          return (
            <Table.Row key={quality}>
              <Table.Cell>{t(Qualities[quality])}</Table.Cell>
              {Object.keys(Providers).map(provider => {
                const price = prices.find(price => price.provider === provider)
                const url = skin ? getSkinUrlFromProvider(skin, provider) : ''

                return (
                  <Table.Cell
                    key={provider}
                    positive={price && price.price === minPrice}
                    negative={price && minPrice < maxPrice && price.price === maxPrice}
                  >
                    {price
                      ? <TrackedLink href={url}>{t(`common:currency.${currency}`, { price: price.price })}</TrackedLink>
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
  t: PropTypes.func.isRequired,
  skins: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      quality: PropTypes.string.isRequired,
      statTrak: PropTypes.bool.isRequired,
      souvenir: PropTypes.bool.isRequired,
      prices: PropTypes.arrayOf(
        PropTypes.shape({
          provider: PropTypes.string.isRequired,
          price: PropTypes.number.isRequired
        })
      )
    })
  ).isRequired,
  statTrak: PropTypes.bool.isRequired,
  souvenir: PropTypes.bool.isRequired
}

export default withTranslation(['csgo', 'common'])(SkinPrices)
