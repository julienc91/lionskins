import React from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import { Card, Flag, List, Reveal } from "semantic-ui-react";
import Image from "../Image";

const Team = ({ team }) => {
  return (
    <Card key={team.slug} className="team item">
      <Reveal animated="move">
        <Reveal.Content visible>
          <Image
            alt={team.name}
            imageSrc={`/images/csgo/teams/${team.slug}.png`}
            loaderSrc="/images/csgo/teams/default.png"
          />
        </Reveal.Content>
        <Reveal.Content hidden>
          <List selection>
            {team.players.map((player, i) => (
              <List.Item key={i}>
                <List.Icon>
                  <Flag name={player.countryCode} />
                </List.Icon>
                <List.Content>
                  <Link
                    href={`/counter-strike-global-offensive/teams/${team.slug}/${player.slug}/`}
                  >
                    <a>{player.nickname}</a>
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
  );
};

Team.propTypes = {
  team: PropTypes.shape({
    name: PropTypes.string,
    slug: PropTypes.string,
    players: PropTypes.arrayOf(
      PropTypes.shape({
        nickname: PropTypes.string,
        slug: PropTypes.string,
        countryCode: PropTypes.string,
        role: PropTypes.string,
      })
    ),
  }),
};

export default Team;
