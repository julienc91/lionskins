import React from 'react'
import useTranslation from 'next-translate/useTranslation'
import PropTypes from 'prop-types'
import { Icon, Table } from 'semantic-ui-react'
import { Providers } from '../../utils/enums'
import { Rarities } from '../../utils/csgo/enums'
import { formatPrice } from '../../utils/i18n'

const SkinSummary = ({ skins }) => {
  const { t, lang } = useTranslation('csgo')

  const isAgent = skins[0].type === 'agents'
  const isMusicKit = skins[0].type === 'music_kits'
  const isGraffiti = skins[0].type === 'graffitis'
  const isSticker = skins[0].type === 'stickers'
  const isWeaponSkin = !isAgent && !isMusicKit && !isGraffiti && !isSticker

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
          {(isAgent || isMusicKit || isGraffiti || isSticker) && <Table.HeaderCell>{t('csgo.skin.type')}</Table.HeaderCell>}
          {rarity && <Table.HeaderCell>{t('csgo.skin.rarity')}</Table.HeaderCell>}
          {isWeaponSkin && <Table.HeaderCell>{t('csgo.skin.stat_trak')}</Table.HeaderCell>}
          {isWeaponSkin && <Table.HeaderCell>{t('csgo.skin.souvenir')}</Table.HeaderCell>}
          <Table.HeaderCell>{t('csgo.skin.price_range')}</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        <Table.Row>
          {(isAgent || isMusicKit || isGraffiti || isSticker) && <Table.Cell>{t(`csgo.types.${skins[0].type}`)}</Table.Cell>}
          {rarity && <Table.Cell>{rarity}</Table.Cell>}
          {isWeaponSkin && (<Table.Cell positive={hasStatTrak}>
            <Icon name={hasStatTrak ? 'check' : 'x'} />
          </Table.Cell>)}
          {isWeaponSkin && (<Table.Cell positive={hasSouvenir}>
            <Icon name={hasSouvenir ? 'check' : 'x'} />
          </Table.Cell>)}
          <Table.Cell>
            {formatPrice(minPrice, lang)}
            <span> - </span>
            {formatPrice(maxPrice, lang)}
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
      type: PropTypes.string.isRequired,
      weapon: PropTypes.shape({
        name: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired
      })
    })
  ).isRequired
}

export default SkinSummary
