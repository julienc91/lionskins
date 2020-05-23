import React from 'react'
import { Helmet } from 'react-helmet'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import * as actions from '../../actions'
import Skin from '../../components/csgo/Skin'
import Filter from '../../components/csgo/Filter'
import { Button, Card, Header, Icon, Loader, Sidebar } from 'semantic-ui-react'
import Breadcrumb from '../../components/tools/Breadcrumb'
import Changelog from '../../components/Changelog'
import InfiniteScroll from 'react-infinite-scroller'
import PropTypes from 'prop-types'

class SkinList extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      showSidebar: false
    }

    this.handleShowSidebar = this.handleShowSidebar.bind(this)
    this.handleHideSidebar = this.handleHideSidebar.bind(this)
    this.handleToggleSidebar = this.handleToggleSidebar.bind(this)
  }

  componentDidMount () {
    const { resetSkinList } = this.props
    resetSkinList()
  }

  renderChild (skin) {
    return <Skin key={skin.id} skin={skin} />
  }

  prepareSkins () {
    const { groupSimilar, hasNextPage, skins } = this.props
    let skinList = []
    if (groupSimilar) {
      skins.forEach(skin => {
        const lastGroupedSkin = (!skinList.length) ? null : skinList[skinList.length - 1]
        if (lastGroupedSkin && lastGroupedSkin.slug === skin.slug && lastGroupedSkin.weapon.name === skin.weapon.name) {
          lastGroupedSkin.souvenir = lastGroupedSkin.souvenir || skin.souvenir
          lastGroupedSkin.statTrak = lastGroupedSkin.statTrak || skin.statTrak
          lastGroupedSkin.rarity = lastGroupedSkin.rarity || skin.rarity
          lastGroupedSkin.imageUrl = lastGroupedSkin.imageUrl || skin.imageUrl
          const prices = {}
          lastGroupedSkin.prices.forEach(price => {
            prices[price.provider] = price
          })
          skin.prices.forEach(price => {
            if (!prices[price.provider] || prices[price.provider].price > price.price) {
              prices[price.provider] = price
            }
          })
          lastGroupedSkin.prices = Object.values(prices)
        } else {
          skin = { ...skin }
          skin.quality = ''
          skinList.push(skin)
        }
      })
      if (hasNextPage) {
        skinList.pop()
      }
    } else {
      skinList = skins
    }
    return skinList
  }

  handleShowSidebar () {
    if (!this.state.showSidebar) {
      this.setState({ showSidebar: true })
    }
  }

  handleHideSidebar () {
    if (this.state.showSidebar) {
      this.setState({ showSidebar: false })
    }
  }

  handleToggleSidebar () {
    this.setState({ showSidebar: !this.state.showSidebar })
  }

  render () {
    const { getSkinList, hasNextPage, t } = this.props
    const { showSidebar } = this.state

    const skins = this.prepareSkins()

    return (
      <div className='skin-list-container'>
        <Helmet
          title={t('csgo.skin_list.page_title')}
        />

        <Sidebar
          className={'skin-list-filter-container' + (showSidebar ? ' active' : '')}
          visible onClick={this.handleShowSidebar}
        >
          <Icon name='angle double right' className='expand-icon' onClick={this.handleToggleSidebar} />
          <Filter />
        </Sidebar>

        <div className='skin-list' onClick={this.handleHideSidebar}>

          <div className='breadcrumb-container'>
            <Breadcrumb items={[{ name: 'Counter-Strike: Global Offensive' }]} />
          </div>

          <div className='inventory-link'>
            <Button primary icon labelPosition='left' as={p => <Link to='/counter-strike-global-offensive/my-inventory' {...p} />}>
              <Icon name='steam' />
              {t('csgo.skin_list.inventory_link')}
            </Button>
          </div>

          <Changelog />

          {(skins.length || hasNextPage) ? (
            <InfiniteScroll
              initialLoad
              loadMore={getSkinList}
              hasMore={hasNextPage}
              loader={<Loader active inline='centered' key='loader' />}
            >
              <Card.Group className='skin-list-inner'>
                {skins.map((skin) => this.renderChild(skin))}
                <div className='padding-item' />
                <div className='padding-item' />
                <div className='padding-item' />
                <div className='padding-item' />
                <div className='padding-item' />
              </Card.Group>
            </InfiniteScroll>
          ) : (
            <Header as='h2' icon className='no-results'>
              <Icon name='frown outline' />
              {t('skin_list.no_results.title')}
              <Header.Subheader>{t('skin_list.no_results.subtitle')}</Header.Subheader>
            </Header>
          )}
        </div>
      </div>
    )
  }
}

SkinList.propTypes = {
  getSkinList: PropTypes.func.isRequired,
  resetSkinList: PropTypes.func.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  groupSimilar: PropTypes.bool.isRequired,
  skins: PropTypes.arrayOf(
    PropTypes.shape({
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
  ).isRequired,
  t: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    skins: state.csgo.skins,
    hasNextPage: state.csgo.hasNextPage,
    groupSimilar: state.csgo.filters.group
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    actions
  )(SkinList)
)
