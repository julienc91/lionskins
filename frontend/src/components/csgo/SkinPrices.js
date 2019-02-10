import React from 'react'
import { Table } from 'semantic-ui-react'
import { getIconFromProvider, getSkinUrlFromProvider } from './utils'
import { Providers } from '../enums'
import { Qualities } from './enums'
import TrackedLink from '../tools/TrackedLink'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'

class SkinPrices extends React.Component {
  providers = ['steam', 'bitskins', 'csgoshop', 'lootbear', 'skinbaron']
  qualities = ['factory_new', 'minimal_wear', 'field_tested', 'well_worn', 'battle_scarred']

  render () {
    const { skins, statTrak, souvenir, t } = this.props

    return (
      <Table unstackable celled singleLine textAlign='center'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t('csgo.skin.quality')}</Table.HeaderCell>
            {this.providers.map(provider =>
              <Table.HeaderCell key={provider}>
                {getIconFromProvider(provider)}
                {Providers[provider]}
              </Table.HeaderCell>
            )}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {this.qualities.map(quality => {
            const skin = skins.find(
              skin => skin.statTrak === statTrak &&
              skin.souvenir === souvenir &&
              skin.quality === quality
            )
            const prices = skin ? skin.prices : []
            const minPrice = Math.min(...prices.map(price => price.price))
            const maxPrice = Math.max(...prices.map(price => price.price))

            return <Table.Row key={quality}>
              <Table.Cell>{t(Qualities[quality])}</Table.Cell>
              {this.providers.map(provider => {
                const price = prices.find(price => price.provider === provider)
                const url = skin ? getSkinUrlFromProvider(skin, provider) : ''

                return (
                  <Table.Cell
                    key={provider}
                    positive={price && price.price === minPrice}
                    negative={price && minPrice < maxPrice && price.price === maxPrice}>
                    {price
                      ? <TrackedLink href={url}>{t(`currency.${price.currency}`, { price: price.price })}</TrackedLink>
                      : ''}
                  </Table.Cell>
                )
              })}
            </Table.Row>
          })}
        </Table.Body>
      </Table>
    )
  }
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
          price: PropTypes.number.isRequired,
          currency: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired,
  statTrak: PropTypes.bool.isRequired,
  souvenir: PropTypes.bool.isRequired
}

export default withTranslation()(SkinPrices)
