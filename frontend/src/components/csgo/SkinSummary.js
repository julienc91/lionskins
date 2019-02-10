import React from 'react'
import { Rarities } from './enums'
import { Icon, Table } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'

class SkinSummary extends React.Component {
  render () {
    const { skins, t } = this.props
    const rarity = t(Rarities[skins.find(s => s.rarity).rarity])
    const hasStatTrak = skins.some(s => s.statTrak)
    const hasSouvenir = skins.some(s => s.souvenir)
    const currency = skins[0].prices[0].currency

    const allPrices = []

    skins.forEach(skin => {
      skin.prices.forEach(price => {
        allPrices.push(price.price)
      })
    })

    const minPrice = Math.min(...allPrices)
    const maxPrice = Math.max(...allPrices)

    return (
      <Table unstackable celled textAlign='center' className='skin-summary'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{t('csgo.skin.rarity')}</Table.HeaderCell>
            <Table.HeaderCell>{t('csgo.skin.stat_trak')}</Table.HeaderCell>
            <Table.HeaderCell>{t('csgo.skin.souvenir')}</Table.HeaderCell>
            <Table.HeaderCell>{t('csgo.skin.price_range')}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell>{rarity}</Table.Cell>
            <Table.Cell positive={hasStatTrak}>
              <Icon name={hasStatTrak ? 'check' : 'x'} />
            </Table.Cell>
            <Table.Cell positive={hasSouvenir}>
              <Icon name={hasSouvenir ? 'check' : 'x'} />
            </Table.Cell>
            <Table.Cell>
              {t(`currency.${currency}`, { price: minPrice })}
              <span> - </span>
              {t(`currency.${currency}`, { price: maxPrice })}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }
}

SkinSummary.propTypes = {
  t: PropTypes.func.isRequired,
  skins: PropTypes.arrayOf(
    PropTypes.shape({
      rarity: PropTypes.string,
      statTrak: PropTypes.bool.isRequired,
      souvenir: PropTypes.bool.isRequired,
      prices: PropTypes.arrayOf(
        PropTypes.shape({
          price: PropTypes.number.isRequired,
          currency: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired
}

export default withTranslation()(SkinSummary)
