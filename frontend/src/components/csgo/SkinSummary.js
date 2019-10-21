import React from 'react'
import { Rarities } from './enums'
import { Icon, Table } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import * as actions from '../../actions'

class SkinSummary extends React.Component {
  render () {
    const { currency, skins, t } = this.props
    const hasRarity = skins.find(s => s.rarity)
    const rarity = hasRarity ? t(Rarities[hasRarity.rarity]) : null
    const hasStatTrak = skins.some(s => s.statTrak)
    const hasSouvenir = skins.some(s => s.souvenir)

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
            {rarity && <Table.HeaderCell>{t('csgo.skin.rarity')}</Table.HeaderCell>}
            <Table.HeaderCell>{t('csgo.skin.stat_trak')}</Table.HeaderCell>
            <Table.HeaderCell>{t('csgo.skin.souvenir')}</Table.HeaderCell>
            <Table.HeaderCell>{t('csgo.skin.price_range')}</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            {rarity && <Table.Cell>{rarity}</Table.Cell>}
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
  currency: PropTypes.string.isRequired,
  skins: PropTypes.arrayOf(
    PropTypes.shape({
      rarity: PropTypes.string,
      statTrak: PropTypes.bool.isRequired,
      souvenir: PropTypes.bool.isRequired,
      prices: PropTypes.arrayOf(
        PropTypes.shape({
          price: PropTypes.number.isRequired
        })
      )
    })
  ).isRequired
}

const mapStateToProps = state => {
  return {
    currency: state.main.currency
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    actions
  )(SkinSummary)
)
