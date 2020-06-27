import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { Trans, withTranslation } from 'react-i18next'
import { Card, Container, Header, Icon, Loader } from 'semantic-ui-react'
import Breadcrumb from '../../components/tools/Breadcrumb'
import slugify from 'slugify'
import PropTypes from 'prop-types'
import { getInventoryQuery } from '../../api/inventory'
import Skin from '../../components/csgo/Skin'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import PageNotFound from '../PageNotFound'

class PlayerInventoryPage extends Component {
  rootName = 'inventory'

  constructor (props) {
    super(props)
    this.state = {
      data: null,
      skins: null,
      loading: true,
      team: null,
      player: null
    }

    this.executeQuery = this.executeQuery.bind(this)
    this.loadPlayer = this.loadPlayer.bind(this)
    this.handleLoadInventory = this.handleLoadInventory.bind(this)
  }

  componentDidMount () {
    this.fetchData()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    const { currency } = this.props
    if (currency !== prevProps.currency) {
      this.handleLoadInventory()
    }
  }

  fetchData () {
    window.fetch('/players.json').then(res => res.json()).then(data => {
      this.setState({ data }, this.loadPlayer)
    })
  }

  loadPlayer () {
    const { data } = this.state
    const getSlug = s => slugify(s, { lower: true })

    const teamSlug = this.props.match.params.team
    const playerSlug = this.props.match.params.player
    const team = data.find(t => getSlug(t.name) === teamSlug)
    let player
    if (team) {
      player = team.players.find(p => getSlug(p.name) === playerSlug)
    }

    this.setState({ team, player }, this.handleLoadInventory)
  }

  handleLoadInventory () {
    this.setState({ loading: true, skins: null }, this.executeQuery)
  }

  async executeQuery () {
    const { currency } = this.props
    const { player } = this.state

    if (!player || !player.steamId) {
      this.setState({ loading: false })
      return
    }

    const result = await this.props.client.query({
      query: getInventoryQuery,
      variables: {
        currency,
        steamId: player.steamId
      }
    })

    const skins = result.data[this.rootName].edges.map(e => e.node)
    this.setState({ skins, loading: false })
  }

  renderChild (skin) {
    return <Skin key={skin.id} skin={skin} />
  }

  render () {
    const { t } = this.props
    const { loading, player, skins, team } = this.state

    if (!loading && (!player || !team)) {
      return <PageNotFound />
    } else if (loading && (!player || !team)) {
      return <Container className='page'><Loader active inline='centered' /></Container>
    }

    return (
      <Container className='page inventory'>
        <Helmet
          title={`${t('csgo.pro_player.page_title')} - ${player.name} (${team.name})`}
        />

        <Breadcrumb
          items={[
            { name: 'Counter-Strike: Global Offensive', link: '/counter-strike-global-offensive/' },
            { name: t('csgo.teams.breadcrumb'), link: '/counter-strike-global-offensive/teams/' },
            { name: team.name },
            { name: player.name }
          ]}
        />

        <Header as='h1' textAlign='center'>
          {player.name}
          <Header.Subheader>
            <Trans i18nKey='csgo.pro_player.subtitle'>{{ team: team.name }}</Trans>
          </Header.Subheader>
        </Header>

        {loading && <Loader active inline='centered' />}

        {!loading && (!skins || skins.length === 0) && (
          <Header as='h2' icon textAlign='center'>
            <Icon name='frown outline' />
            {t('csgo.pro_player.no_results_title')}
            <Header.Subheader>
              {t('csgo.pro_player.no_results_subtitle')}
            </Header.Subheader>
          </Header>
        )}

        {!loading && skins && skins.length > 0 && (
          <Header as='h3' textAlign='center'>
            <Trans i18nKey='csgo.pro_player.description'>{{ player: player.name }}</Trans>
          </Header>
        )}

        {!loading && skins && skins.length > 0 && (
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
        )}
      </Container>
    )
  }
}

PlayerInventoryPage.propTypes = {
  t: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      team: PropTypes.string.isRequired,
      player: PropTypes.string.isRequired
    })
  })
}

const mapStateToProps = state => {
  return {
    currency: state.main.currency
  }
}

export default withApollo(
  withTranslation()(
    connect(
      mapStateToProps,
      actions
    )(PlayerInventoryPage)
  )
)
