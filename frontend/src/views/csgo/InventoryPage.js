import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { withTranslation } from 'react-i18next'
import { Card, Container, Header, Icon, Loader } from 'semantic-ui-react'
import Breadcrumb from '../../components/tools/Breadcrumb'
import PropTypes from 'prop-types'
import SteamOpenId from '../../assets/images/steam_openid.png'
import { getInventoryQuery } from '../../api/inventory'
import Skin from '../../components/csgo/Skin'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import * as actions from '../../actions'

class InventoryPage extends Component {
  rootName = 'inventory'

  constructor (props) {
    super(props)
    this.state = {
      skins: null,
      loading: false
    }

    this.executeQuery = this.executeQuery.bind(this)
  }

  componentDidMount () {
    const { steamId } = this.props
    if (window.location.search.indexOf('steam_id=') >= 0) {
      const updatedSteamId = window.location.search.split('steam_id=')[1].split('&')[0]
      if (updatedSteamId) {
        const { history, setSteamId } = this.props
        setSteamId(updatedSteamId)
        history.replace(window.location.pathname)
      }
    } else if (steamId) {
      this.handleLoadInventory()
    }
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { currency, steamId } = this.props
    if (steamId !== prevProps.steamId || currency !== prevProps.currency) {
      this.handleLoadInventory()
    }
  }

  handleLoadInventory () {
    const { steamId } = this.props
    if (!steamId) {
      return
    }

    this.setState({ loading: true, skins: null }, this.executeQuery)
  }

  async executeQuery () {
    const { currency, steamId } = this.props
    const result = await this.props.client.query({
      query: getInventoryQuery,
      variables: {
        steamId,
        currency
      }
    })

    const skins = result.data[this.rootName].edges.map(e => e.node)
    this.setState({ skins, loading: false })
  }

  renderChild (skin) {
    return <Skin key={skin.id} skin={skin} />
  }

  render () {
    const { currency, steamId, t } = this.props
    const { loading, skins } = this.state

    let minCost
    if (skins && skins.length > 0) {
      minCost = skins.map(skin => Math.min(...skin.prices.map(price => price.price))).reduce((a, b) => a + b)
    }

    return (
      <Container className='page inventory'>
        <Helmet
          title={t('csgo.inventory.page_title')}
        />

        <Header as='h1' textAlign='center'>{t('csgo.inventory.title')}</Header>

        <div className='skin-list'>
          <div className='breadcrumb-container'>
            <Breadcrumb
              items={[
                { name: 'Counter-Strike: Global Offensive', link: '/counter-strike-global-offensive/' },
                { name: t('csgo.inventory.breadcrumb') }
              ]}
            />
          </div>
          {!steamId && (
            <Header as='h2' icon textAlign='center'>
              <Icon name='steam symbol' />
              {t('csgo.inventory.sign_in_title')}
              <Header.Subheader>
                {t('csgo.inventory.sign_in_subtitle')}
              </Header.Subheader>
              <a href={`${process.env.REACT_APP_API_DOMAIN}/steam/login?redirect=${window.location.pathname}`}>
                <img alt={t('csgo.inventory.steam_login')} src={SteamOpenId} />
              </a>
            </Header>
          )}
          {loading && steamId && <Loader active inline='centered' />}
          {!loading && steamId && (!skins || skins.length === 0) && (
            <Header as='h2' icon textAlign='center'>
              <Icon name='frown outline' />
              {t('csgo.inventory.no_results_title')}
              <Header.Subheader>
                {t('csgo.inventory.no_results_subtitle')}
              </Header.Subheader>
            </Header>
          )}
          {!loading && steamId && skins && skins.length > 0 && (
            <>
              <Header as='h2' icon textAlign='center'>
                <Icon name={currency} />
                {t(`currency.${currency}`, { price: minCost })}<br />{t('csgo.inventory.summary_title')}
                <Header.Subheader>
                  {t('csgo.inventory.summary_subtitle')}
                </Header.Subheader>
              </Header>

              <Card.Group className='skin-list-inner'>
                {skins.map((skin) => this.renderChild(skin))}
                <div className='padding-item' />
                <div className='padding-item' />
                <div className='padding-item' />
                <div className='padding-item' />
                <div className='padding-item' />
              </Card.Group>
            </>
          )}
        </div>
      </Container>
    )
  }
}

InventoryPage.propTypes = {
  t: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  steamId: PropTypes.string,
  setSteamId: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    currency: state.main.currency,
    steamId: state.main.steamId
  }
}

export default withApollo(
  withTranslation()(
    connect(
      mapStateToProps,
      actions
    )(InventoryPage)
  )
)
