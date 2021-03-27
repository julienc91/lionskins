import React from 'react'
import { useTranslation } from 'next-i18next'
import PropTypes from 'prop-types'
import { Icon, Table } from 'semantic-ui-react'
import useSettings from '../SettingsProvider'
import { Providers } from '../../utils/enums'
import { Categories, Rarities } from '../../utils/csgo/enums'

const SkinSummary = ({ skins }) => {
  const { t } = useTranslation('csgo')
  const { currency } = useSettings()
  const isAgent = skins[0].weapon.category === 'agents'
  const hasRarity = skins.find(s => s.rarity)
  const rarity = hasRarity ? t(Rarities[hasRarity.rarity]) : null
  const hasStatTrak = skins.some(s => s.statTrak)
  const hasSouvenir = skins.some(s => s.souvenir)

  const allPrices = []
  skins.forEach(skin => {
    Object.keys(Providers).forEach(provider => {
      if (skin.prices && skin.prices[provider]) {
        allPrices.push(skin.prices[provider])
      }
    })
  })

  const minPrice = Math.min(...allPrices)
  const maxPrice = Math.max(...allPrices)

  return (
    <Table unstackable celled textAlign='center' className='skin-summary'>
      <Table.Header>
        <Table.Row>
          {isAgent && <Table.HeaderCell>{t('csgo.skin.type')}</Table.HeaderCell>}
          {rarity && <Table.HeaderCell>{t('csgo.skin.rarity')}</Table.HeaderCell>}
          {!isAgent && <Table.HeaderCell>{t('csgo.skin.stat_trak')}</Table.HeaderCell>}
          {!isAgent && <Table.HeaderCell>{t('csgo.skin.souvenir')}</Table.HeaderCell>}
          <Table.HeaderCell>{t('csgo.skin.price_range')}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <Table.Row>
          {isAgent && <Table.Cell>{t(Categories[skins[0].weapon.category])}</Table.Cell>}
          {rarity && <Table.Cell>{rarity}</Table.Cell>}
          {!isAgent && (<Table.Cell positive={hasStatTrak}>
            <Icon name={hasStatTrak ? 'check' : 'x'} />
          </Table.Cell>)}
          {!isAgent && (<Table.Cell positive={hasSouvenir}>
            <Icon name={hasSouvenir ? 'check' : 'x'} />
          </Table.Cell>)}
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
      statTrak: PropTypes.bool,
      souvenir: PropTypes.bool,
      prices: PropTypes.shape({
        bitskins: PropTypes.number,
        csmoney: PropTypes.number,
        skinbaron: PropTypes.number,
        skinport: PropTypes.number,
        steam: PropTypes.number
      }),
      weapon: PropTypes.shape({
        name: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired
      })
    })
  ).isRequired
}

export default SkinSummary
