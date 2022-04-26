import React from "react";
import { gql, useQuery } from "@apollo/client";
import axios from "axios";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import Trans from "next-translate/Trans";
import PropTypes from "prop-types";
import { Card, Container, Header, Icon, Loader } from "semantic-ui-react";
import slugify from "slugify";
import Breadcrumb from "../../../../components/Breadcrumb";
import useSettings from "../../../../components/SettingsProvider";
import Skin from "../../../../components/csgo/Skin";
import { client } from "../../../../apollo";

const getTeamQuery = gql`
  query ($slug: String!) {
    teams(slug: $slug) {
      edges {
        node {
          id
          name
          slug
          players {
            nickname
            slug
            countryCode
            role
            steamId
          }
        }
      }
    }
  }
`;

export const getInventoryQuery = gql`
  query ($steamId: String, $currency: TypeCurrency) {
    inventory(steamId: $steamId) {
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
          type
          prices(currency: $currency) {
            bitskins
            csmoney
            skinbaron
            skinport
            steam
          }
        }
      }
    }
  }
`;

const Player = ({ player, team }) => {
  const { t } = useTranslation("csgo");
  const { currency } = useSettings();
  const { data, loading } = useQuery(getInventoryQuery, {
    variables: { steamId: player.steamId, currency },
    notifyOnNetworkStatusChange: true,
  });

  const skins =
    loading || !data ? [] : data.inventory.edges.map(({ node }) => node);

  return (
    <Container className="page inventory">
      <Head>
        <title>{`${t("csgo.pro_player.page_title")} - ${player.nickname} (${
          team.name
        })`}</title>
      </Head>

      <Breadcrumb
        items={[
          {
            name: "Counter-Strike: Global Offensive",
            link: "/counter-strike-global-offensive/",
          },
          {
            name: t("csgo.teams.breadcrumb"),
            link: "/counter-strike-global-offensive/teams/",
          },
          { name: team.name },
          { name: player.nickname },
        ]}
      />

      <Header as="h1" textAlign="center">
        {player.nickname}
        <Header.Subheader>
          <Trans
            i18nKey="csgo:csgo.pro_player.subtitle"
            values={{
              player: player.nickname,
              role: t(`csgo.pro_player.role.${player.role}`),
              team: team.name,
            }}
          />
        </Header.Subheader>
      </Header>

      {loading && <Loader active inline="centered" />}

      {!loading && (!skins || skins.length === 0) && (
        <Header as="h2" icon textAlign="center">
          <Icon name="frown outline" />
          {t("csgo.pro_player.no_results_title")}
          <Header.Subheader>
            <Trans
              i18nKey="csgo:csgo.pro_player.no_results_subtitle"
              values={{ player: player.nickname }}
            />
          </Header.Subheader>
        </Header>
      )}

      {!loading && skins && skins.length > 0 && (
        <div className="skin-list">
          <Card.Group className="item-list">
            {skins.map((skin) => (
              <Skin key={skin.id} skin={skin} />
            ))}
            <div className="padding-item" />
            <div className="padding-item" />
            <div className="padding-item" />
            <div className="padding-item" />
            <div className="padding-item" />
          </Card.Group>
        </div>
      )}
    </Container>
  );
};

Player.propTypes = {
  player: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
};

export const getServerSideProps = async ({ query }) => {
  const { data } = await client.query({
    query: getTeamQuery,
    variables: { slug: query.team },
  });

  if (!data.teams.edges.length) {
    return { notFound: true };
  }

  const team = data.teams.edges[0].node;
  const player = team.players.find((p) => p.slug === query.player);
  if (!player) {
    return { notFound: true };
  }

  return { props: { team, player } };
};

export default Player;
