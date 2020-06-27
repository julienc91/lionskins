import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { Trans, withTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import slugify from 'slugify'
import { Card, Container, Flag, Header, List, Loader, Reveal } from 'semantic-ui-react'
import Breadcrumb from '../../components/tools/Breadcrumb'
import PropTypes from 'prop-types'

const assets = require.context('../../assets/images/csgo/teams/')

class TeamList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      data: []
    }
  }

  componentDidMount () {
    this.fetchData()
  }

  fetchData () {
    window.fetch('/players.json').then(res => res.json()).then(data => {
      this.setState({ data, loading: false })
    })
  }

  renderTeam (team) {
    const teamSlug = slugify(team.name, { lower: true })
    let image
    try {
      image = assets(`./${teamSlug}.png`)
    } catch {
      image = assets('./default.png')
    }
    return (
      <Card key={teamSlug} className='team item'>
        <Reveal animated='move'>
          <Reveal.Content visible>
            <img src={image} alt={team.name} />
          </Reveal.Content>
          <Reveal.Content hidden>
            <List selection>
              {team.players.map((player, i) => (
                <List.Item key={i}>
                  <List.Icon>
                    <Flag name={player.country} />
                  </List.Icon>
                  <List.Content>
                    <Link to={`/counter-strike-global-offensive/teams/${teamSlug}/${slugify(player.name, { lower: true })}/`}>
                      {player.name}
                    </Link>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </Reveal.Content>
        </Reveal>
        <Card.Content>
          <Card.Header>{team.name}</Card.Header>
        </Card.Content>
      </Card>
    )
  }

  render () {
    const { loading, data } = this.state
    const { t } = this.props
    return (
      <Container className='page pro-players'>
        <Helmet
          title={t('csgo.teams.page_title')}
        />

        <Breadcrumb
          items={[
            { name: 'Counter-Strike: Global Offensive', link: '/counter-strike-global-offensive/' },
            { name: t('csgo.teams.breadcrumb') }
          ]}
        />

        <Header as='h1' textAlign='center'>
          {t('csgo.teams.title')}
          <Header.Subheader>
            {t('csgo.teams.subtitle')}
          </Header.Subheader>
        </Header>

        {loading && <Loader active inline='centered' />}

        <div className='team-list'>
          <Card.Group className='item-list'>
            {data && data.map(team => this.renderTeam(team))}
            <div className='padding-item' />
            <div className='padding-item' />
            <div className='padding-item' />
            <div className='padding-item' />
          </Card.Group>

          <div className='disclaimer'>
            <Trans i18nKey='csgo.teams.disclaimer'>
              <a href='https://www.hltv.org/' target='_blank' rel='noopener noreferrer'>-</a>
              <a href='https://liquipedia.net/counterstrike/' target='_blank' rel='noopener noreferrer'>-</a>
            </Trans>
          </div>

        </div>
      </Container>
    )
  }
}

TeamList.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(TeamList)
