import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { Card, Label } from 'semantic-ui-react'
import { Qualities, Weapons } from './enums'
import { getColorFromRarity, getIconFromProvider, getSkinUrlFromProvider } from './utils'
import Img from 'react-image'
import PropTypes from 'prop-types'
import * as actions from '../../actions'
import { getSkinInternalUrl, importAll } from '../../tools'
import TrackedLink from '../tools/TrackedLink'

const defaultWeaponImages = importAll(require.context('../../assets/images/csgo/', false, /default_skin_\w+\.png/))

class Skin extends Component {
  render () {
    const { currency, skin, t } = this.props
    const internalUrl = getSkinInternalUrl(skin)
    const defaultWeaponImage = defaultWeaponImages[`default_skin_${skin.weapon.name}.png`]

    const alt = `${skin.weapon.name} - ${skin.name}`
    const defaultImage = <img src={defaultWeaponImage} className='ui image' alt={alt} />

    return (
      <Card color={getColorFromRarity(skin.rarity)} className='skin'>
        <Link to={internalUrl}>
          <Img
            src={skin.imageUrl}
            className='ui image'
            loader={defaultImage}
            unloader={defaultImage}
            alt={alt}
          />
        </Link>
        {skin.statTrak && (
          <Label className='stattrak' color='orange'>{t('csgo.skin.stat_trak')}</Label>
        )}
        {skin.souvenir && (
          <Label className='souvenir' color='yellow'>{t('csgo.skin.souvenir')}</Label>
        )}
        <Card.Content>
          <Card.Header>
            <Link to={internalUrl}>{t(Weapons[skin.weapon.name])} - {skin.name}</Link>
          </Card.Header>
          <Card.Meta>
            {t(Qualities[skin.quality])}
          </Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <div className='prices'>
            {skin.prices.sort((p1, p2) => p1.provider > p2.provider).map(price => {
              return (
                <div className='price' key={price.provider}>
                  <TrackedLink href={getSkinUrlFromProvider(skin, price.provider)}>
                    {getIconFromProvider(price.provider)}
                    {t(`currency.${currency}`, { price: price.price })}
                  </TrackedLink>
                </div>
              )
            })}
          </div>
        </Card.Content>
      </Card>
    )
  }
}

Skin.propTypes = {
  t: PropTypes.func.isRequired,
  currency: PropTypes.string.isRequired,
  skin: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    quality: PropTypes.string.isRequired,
    rarity: PropTypes.string,
    statTrak: PropTypes.bool.isRequired,
    souvenir: PropTypes.bool.isRequired,
    weapon: PropTypes.shape({
      name: PropTypes.string.isRequired
    }),
    prices: PropTypes.arrayOf(
      PropTypes.shape({
        provider: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired
      })
    )
  })
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
  )(Skin)
)
