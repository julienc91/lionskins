import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import { Container, Header, Table, Icon } from 'semantic-ui-react'
import { Qualities, Rarities, Weapons } from './enums'
import { Providers } from '../enums'
import { FormattedNumber, injectIntl } from 'react-intl'
import { getIconFromProvider, getSkinUrlFromProvider } from './utils'
import Img from 'react-image'
import slugify from 'slugify'
import PropTypes from 'prop-types'
import Breadcrumb from '../Breadcrumb'
import PageNotFound from '../PageNotFound'
import TrackedLink from '../TrackedLink'

const importAll = (r) => {
  let images = {}
  r.keys().forEach((item) => { images[item.replace('./', '')] = r(item) })
  return images
}

const defaultWeaponImages = importAll(require.context('../../assets/images/csgo/', false, /default_skin_\w+\.png/))

class SkinPage extends Component {
  rootName = 'csgo'
  query = gql`
    query ($weapon: CSGOWeapons, $slug: String) {
      csgo (weapon: $weapon, slug: $slug) {
        edges {
          node {
            id
            name
            imageUrl
            statTrak
            quality
            rarity
            souvenir
            weapon {
              name
              category
            }
            prices {
              price
              currency
              provider
            }
          }
        }
      }
    }
  `

  constructor (props) {
    super(props)
    this.state = {
      breadcrumb: [
        { name: 'Counter-Strike: Global Offensive', link: '/counter-strike-global-offensive/' }
      ],
      skins: [],
      images: {},
      quality: 'factory_new',
      notFound: false
    }
  }

  componentDidMount () {
    document.title = 'Lion Skins - Counter-Strike: Global Offensive'
    return this.executeQuery()
  }

  async executeQuery () {
    const { weapon, slug } = this.props.match.params
    const result = await this.props.client.query({
      query: this.query,
      variables: {
        weapon: Object.keys(Weapons).find(e => slugify(Weapons[e], { lower: true }) === weapon),
        slug
      }
    })

    const skins = result.data[this.rootName].edges.map(e => e.node)
    if (!skins.length) {
      this.setState({ notFound: true })
      return
    }

    const images = {}
    const breadcrumb = [
      ...this.state.breadcrumb,
      { name: Weapons[skins[0].weapon.name] },
      { name: skins[0].name }
    ]

    Object.keys(Qualities).forEach(quality => {
      let defaultSkin = skins.find(s => s.quality === quality && s.imageUrl)
      let imageUrl = defaultWeaponImages[`default_skin_${skins[0].weapon.name}.png`]
      if (defaultSkin) {
        imageUrl = defaultSkin.imageUrl
      }
      images[quality] = imageUrl
    })

    this.setState({
      breadcrumb,
      skins,
      images
    })

    document.title = `Lion Skins - Counter-Strike: Global Offensive - ${Weapons[skins[0].weapon.name]} - ${skins[0].name}`
  }

  render () {
    const { notFound, breadcrumb, skins, images, quality } = this.state

    if (notFound) {
      return <PageNotFound />
    } else if (!skins.length) {
      return <div />
    }

    const weapon = Weapons[skins[0].weapon.name]
    const skinName = skins[0].name
    const hasStatTrak = !!skins.find(s => s.statTrak)
    const hasSouvenir = !!skins.find(s => s.souvenir)

    return (
      <Container className='skin-page'>
        <Breadcrumb items={breadcrumb} />
        <Header as='h1'>{weapon} - {skinName}</Header>

        <div className='main-content'>

          <div className='left-panel'>

            <Header as='h3' key='header'>Summary</Header>
            <SkinSummary skins={skins} />

            <div className='skin-image'>
              <div className='placeholder'>
                <Img src={defaultWeaponImages[`default_skin_${skins[0].weapon.name}.png`]} alt='' />
              </div>
              <div className='effective'>
                <Img src={images[quality]} alt={`${weapon} - ${skins[0].name}`} />
              </div>
            </div>

            <div className='select-quality'>
              {['factory_new', 'minimal_wear', 'field_tested', 'well_worn', 'battle_scarred'].map(key => {
                const name = Qualities[key]
                return (
                  <div
                    key={key}
                    className={quality === key ? 'active' : ''}
                    onClick={() => this.setState({ quality: key })}>
                    {name}
                  </div>
                )
              })}
            </div>
          </div>

          <div className='right-panel'>
            <div className='skin-prices'>
              <Header as='h3'>Vanilla</Header>
              <SkinPrices skins={skins} statTrak={false} souvenir={false} />

              {hasStatTrak && [
                <Header as='h3' key='header'>StatTrak</Header>,
                <SkinPrices skins={skins} statTrak souvenir={false} key='prices' />
              ]}
              {hasSouvenir && [
                <Header as='h3' key='header'>Souvenir</Header>,
                <SkinPrices skins={skins} statTrak={false} souvenir key='prices' />
              ]}
            </div>
          </div>

        </div>

        <div style={{ clear: 'both' }} />

      </Container>
    )
  }
}

SkinPage.propTypes = {
  client: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      weapon: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired
    })
  })
}

class SkinSummary extends React.Component {
  render () {
    const { skins } = this.props
    const rarity = Rarities[skins[0].rarity]
    const hasStatTrak = !!skins.find(s => s.statTrak)
    const hasSouvenir = !!skins.find(s => s.souvenir)
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
            <Table.HeaderCell>Rarity</Table.HeaderCell>
            <Table.HeaderCell>StatTrak</Table.HeaderCell>
            <Table.HeaderCell>Souvenir</Table.HeaderCell>
            <Table.HeaderCell>Price Range</Table.HeaderCell>
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
              <FormattedNumber value={minPrice} style='currency' currency={currency} />
              <span> - </span>
              <FormattedNumber value={maxPrice} style='currency' currency={currency} />
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    )
  }
}

SkinSummary.propTypes = {
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

class SkinPrices extends React.Component {
  providers = ['steam', 'bitskins', 'csgoshop', 'lootbear']
  qualities = ['factory_new', 'minimal_wear', 'field_tested', 'well_worn', 'battle_scarred']

  render () {
    const { skins, statTrak, souvenir } = this.props

    return (
      <Table unstackable celled singleLine textAlign='center'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Quality</Table.HeaderCell>
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
              <Table.Cell>{Qualities[quality]}</Table.Cell>
              {this.providers.map(provider => {
                const price = prices.find(price => price.provider === provider)
                const url = skin ? getSkinUrlFromProvider(skin, provider) : ''

                return (
                  <Table.Cell
                    key={provider}
                    positive={price && price.price === minPrice}
                    negative={price && minPrice < maxPrice && price.price === maxPrice}>
                    {price
                      ? <TrackedLink href={url}><FormattedNumber value={price.price} style='currency' currency={price.currency} /></TrackedLink>
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

export default injectIntl(withApollo(SkinPage))
