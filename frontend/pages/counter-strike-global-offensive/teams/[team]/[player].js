import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import Trans from "next-translate/Trans";
import PropTypes from "prop-types";
import { Container, Header, Icon } from "semantic-ui-react";
import Breadcrumb from "../../../../components/Breadcrumb";
import useSettings from "../../../../components/SettingsProvider";
import { client } from "../../../../apollo";
import SkinList from "../../../../components/csgo/SkinList";

const getTeamQuery = gql`
  query ($slug: String!) {
    teams(slug: $slug) {
      edges {
        node {
          id
          name
          slug
          players {
            id
            nickname
            slug
            countryCode
            role
          }
        }
      }
    }
  }
`;

export const getInventoryQuery = gql`
  query (
    $first: Int
    $after: String
    $proPlayerId: ID!
    $currency: TypeCurrency
  ) {
    inventory(first: $first, after: $after, proPlayerId: $proPlayerId) {
      pageInfo {
        hasNextPage
        endCursor
      }
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
  const [hasMore, setHasMore] = useState(true);
  const [variables, setVariables] = useState({
    first: 30,
    proPlayerId: player.id,
    currency,
  });

  const { data, fetchMore, loading } = useQuery(getInventoryQuery, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  const getMoreSkins = () => {
    fetchMore({
      variables: {
        ...variables,
        after: data.inventory.pageInfo.endCursor,
      },
    });
  };

  const skins = (data?.inventory?.edges || []).map(({ node }) => node);

  useEffect(() => setVariables((v) => ({ ...v, currency })), [currency]);

  useEffect(
    () =>
      data && data.inventory && setHasMore(data.inventory.pageInfo.hasNextPage),
    [data]
  );

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

      {!loading && !skins.length && (
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
      <div className="skin-list">
        <SkinList
          skins={skins}
          loading={loading}
          hasMore={hasMore}
          getMoreSkins={getMoreSkins}
        />
      </div>
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
