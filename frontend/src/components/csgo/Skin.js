import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Card, Label } from 'semantic-ui-react'
import { Qualities, Weapons } from './enums'
import { FormattedNumber, injectIntl } from 'react-intl'
import { getColorFromRarity, getIconFromProvider, getSkinUrlFromProvider } from './utils'
import slugify from 'slugify'
import Img from 'react-image'
import PropTypes from 'prop-types'
import TrackedLink from '../TrackedLink'

const importAll = (r) => {
  let images = {}
  r.keys().forEach((item) => { images[item.replace('./', '')] = r(item) })
  return images
}

const defaultWeaponImages = importAll(require.context('../../assets/images/csgo/', false, /default_skin_\w+\.png/))

class Skin extends Component {
  render () {
    const { skin } = this.props
    const weaponSlug = slugify(Weapons[skin.weapon.name], { lower: true })
    const internalUrl = `/counter-strike-global-offensive/${weaponSlug}/${skin.slug}/`
    const defaultWeaponImage = defaultWeaponImages[`default_skin_${skin.weapon.name}.png`]
    let imageUrls = [defaultWeaponImage]
    if (skin.imageUrl) {
      imageUrls = [skin.imageUrl, ...imageUrls]
    }

    return (
      <Card color={getColorFromRarity(skin.rarity)} className='skin'>
        <Img
          src={imageUrls} className='ui image'
          onClick={this.props.onImageClicked} alt={`${skin.weapon.name} - ${skin.name}`} />
        {skin.statTrak && (
          <Label className='stattrak' color='orange'>StatTrak</Label>
        )}
        {skin.souvenir && (
          <Label className='souvenir' color='yellow'>Souvenir</Label>
        )}
        <Card.Content>
          <Card.Header>
            <Link to={internalUrl}>{Weapons[skin.weapon.name]} - {skin.name}</Link>
          </Card.Header>
          <Card.Meta>
            {Qualities[skin.quality]}
          </Card.Meta>
        </Card.Content>
        <Card.Content extra>
          <div className='prices'>
            {skin.prices.sort((p1, p2) => p1.provider > p2.provider).map(price => {
              return (
                <div className="price" key={price.provider}>
                  <TrackedLink href={getSkinUrlFromProvider(skin, price.provider)}>
                    {getIconFromProvider(price.provider)}
                    <FormattedNumber value={price.price} style='currency' currency={price.currency} />
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
        price: PropTypes.number.isRequired,
        currency: PropTypes.string.isRequired
      })
    )
  }),
  onImageClicked: PropTypes.func
}

export default injectIntl(Skin)
