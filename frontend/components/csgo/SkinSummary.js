import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Table } from 'semantic-ui-react'
import useSettings from '../SettingsProvider'
import { withTranslation } from '../../i18n'
import { Rarities } from '../../utils/csgo/enums'

const SkinSummary = ({ skins, t }) => {
  const { currency } = useSettings()
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
            {t(`common:currency.${currency}`, { price: minPrice })}
            <span> - </span>
            {t(`common:currency.${currency}`, { price: maxPrice })}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

SkinSummary.propTypes = {
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
  ).isRequired,
  t: PropTypes.func.isRequired
}

export default withTranslation(['csgo', 'common'])(SkinSummary)
