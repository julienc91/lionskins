import React from 'react'
import PropTypes from 'prop-types'
import { Card, Flag, List, Reveal } from 'semantic-ui-react'
import slugify from 'slugify'
import Image from '../Image'
import { Link } from '../../i18n'

const Team = ({ team }) => {
  const teamSlug = slugify(team.name, { lower: true })
  return (
    <Card key={teamSlug} className='team item'>
      <Reveal animated='move'>
        <Reveal.Content visible>
          <Image alt={team.name} imageSrc={`/images/csgo/teams/${teamSlug}.png`} loaderSrc='/images/csgo/teams/default.png' />
        </Reveal.Content>
        <Reveal.Content hidden>
          <List selection>
            {team.players.map((player, i) => (
              <List.Item key={i}>
                <List.Icon>
                  <Flag name={player.country} />
                </List.Icon>
                <List.Content>
                  <Link href={`/counter-strike-global-offensive/teams/${teamSlug}/${slugify(player.name, { lower: true })}/`}>
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

Team.propTypes = {
  team: PropTypes.shape({
    name: PropTypes.string,
    players: PropTypes.array
  })
}

export default Team
