import React from 'react'
import { gql, useQuery } from '@apollo/client'
import axios from 'axios'
import Head from 'next/head'
import PropTypes from 'prop-types'
import { Card, Container, Header, Icon, Loader } from 'semantic-ui-react'
import slugify from 'slugify'
import Page404 from '../../../404'
import Breadcrumb from '../../../../components/Breadcrumb'
import useSettings from '../../../../components/SettingsProvider'
import Skin from '../../../../components/csgo/Skin'
import { Trans, withTranslation } from '../../../../i18n'

export const getInventoryQuery = gql`
  query ($steamId: String, $currency: TypeCurrency) {
    inventory (steamId: $steamId) {
      edges {
        node {
          id
          name
          slug
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
            price (currency: $currency)
            provider
          }
        }
      }
    }
  }`

const Player = ({ player, t, team }) => {
  const { currency } = useSettings()
  const { data, loading } = useQuery(getInventoryQuery, { variables: { steamId: player.steamId, currency }, notifyOnNetworkStatusChange: true })

  if (!player || !team) {
    return <Page404 />
  }

  const skins = (loading || !data) ? [] : data.inventory.edges.map(({ node }) => node)

  return (
    <Container className='page inventory'>
      <Head>
        <title>{`${t('csgo.pro_player.page_title')} - ${player.name} (${team.name})`}</title>
      </Head>

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
          <Trans i18nKey='csgo.pro_player.subtitle' ns='csgo'>{{ team: team.name }}</Trans>
        </Header.Subheader>
      </Header>

      {loading && <Loader active inline='centered' />}

      {!loading && (!skins || skins.length === 0) && (
        <Header as='h2' icon textAlign='center'>
          <Icon name='frown outline' />
          {t('csgo.pro_player.no_results_title')}
          <Header.Subheader>
            <Trans i18nKey='csgo.pro_player.no_results_subtitle' ns='csgo'>{{ player: player.name }}</Trans>
          </Header.Subheader>
        </Header>
      )}

      {!loading && skins && skins.length > 0 && (
        <Header as='h3' textAlign='center'>
          <Trans i18nKey='csgo.pro_player.description' ns='csgo'>{{ player: player.name }}</Trans>
        </Header>
      )}

      {!loading && skins && skins.length > 0 && (
        <div className='skin-list'>
          <Card.Group className='item-list'>
            {skins.map(skin => <Skin key={skin.id} skin={skin} />)}
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

Player.propTypes = {
  player: PropTypes.object,
  t: PropTypes.func.isRequired,
  team: PropTypes.object
}

export const getServerSideProps = async ({ query, res }) => {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_DOMAIN}/teams.json`)
  const team = data.find(t => slugify(t.name, { lower: true }) === query.team)
  if (!team) {
    res.statusCode = 404
    return {}
  }

  const player = team.players.find(p => slugify(p.name, { lower: true }) === query.player)
  if (!player) {
    res.statusCode = 404
    return {}
  }

  return { props: { team, player } }
}

export default withTranslation('csgo')(Player)
