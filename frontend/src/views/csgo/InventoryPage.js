import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { withTranslation } from 'react-i18next'
import { Card, Container, Header, Icon, Loader } from 'semantic-ui-react'
import Breadcrumb from '../../components/tools/Breadcrumb'
import PropTypes from 'prop-types'
import steamOpenId from '../../assets/images/steam_openid.png'
import { getInventoryQuery } from '../../api/inventory'
import Skin from '../../components/csgo/Skin'
import { startOpenId } from '../../tools'
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
    this.handleLoadInventory()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { currency, user } = this.props
    if (user !== prevProps.user || currency !== prevProps.currency) {
      this.handleLoadInventory()
    }
  }

  handleLoadInventory () {
    const { user } = this.props
    if (!user) {
      return
    }

    this.setState({ loading: true, skins: null }, this.executeQuery)
  }

  async executeQuery () {
    const { currency } = this.props
    const result = await this.props.client.query({
      query: getInventoryQuery,
      variables: {
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
    const { currency, user, t } = this.props
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

        <Breadcrumb
          items={[
            { name: 'Counter-Strike: Global Offensive', link: '/counter-strike-global-offensive/' },
            { name: t('csgo.inventory.breadcrumb') }
          ]}
        />

        <Header as='h1' textAlign='center'>{t('csgo.inventory.title')}</Header>

        {!user && (
          <Header as='h2' icon textAlign='center'>
            <Icon name='steam symbol' />
            {t('csgo.inventory.sign_in_title')}
            <Header.Subheader>
              {t('csgo.inventory.sign_in_subtitle')}
            </Header.Subheader>
            <span onClick={startOpenId} style={{ cursor: 'pointer' }}>
              <img alt={t('csgo.inventory.steam_login')} src={steamOpenId} />
            </span>
          </Header>
        )}
        {loading && user && <Loader active inline='centered' />}
        {!loading && user && (!skins || skins.length === 0) && (
          <Header as='h2' icon textAlign='center'>
            <Icon name='frown outline' />
            {t('csgo.inventory.no_results_title')}
            <Header.Subheader>
              {t('csgo.inventory.no_results_subtitle')}
            </Header.Subheader>
          </Header>
        )}
        {!loading && user && skins && skins.length > 0 && (
          <>
            <Header as='h2' icon textAlign='center'>
              <Icon name={currency} />
              {t(`currency.${currency}`, { price: minCost })}<br />{t('csgo.inventory.summary_title')}
              <Header.Subheader>
                {t('csgo.inventory.summary_subtitle')}
              </Header.Subheader>
            </Header>

            <div className='skin-list'>
              <Card.Group className='item-list'>
                {skins.map((skin) => this.renderChild(skin))}
                <div className='padding-item' />
                <div className='padding-item' />
                <div className='padding-item' />
                <div className='padding-item' />
                <div className='padding-item' />
              </Card.Group>
            </div>
          </>
        )}
      </Container>
    )
  }
}

InventoryPage.propTypes = {
  t: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
  user: PropTypes.object
}

const mapStateToProps = state => {
  return {
    currency: state.main.currency,
    user: state.main.user
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
