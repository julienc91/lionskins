import React from "react";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import Trans from "next-translate/Trans";
import { Card, Container, Header } from "semantic-ui-react";
import PropTypes from "prop-types";
import Breadcrumb from "../../components/Breadcrumb";
import Team from "../../components/csgo/Team";
import { gql, useQuery } from "@apollo/client";
import { client } from "../../apollo";

const getTeamsQuery = gql`
  query {
    teams {
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

const TeamList = ({ teams }) => {
  const { t } = useTranslation("csgo");
  return (
    <Container className="page pro-players">
      <Head>
        <title>{t("csgo.teams.page_title")}</title>
      </Head>

      <Breadcrumb
        items={[
          {
            name: "Counter-Strike: Global Offensive",
            link: "/counter-strike-global-offensive/",
          },
          { name: t("csgo.teams.breadcrumb") },
        ]}
      />

      <Header as="h1" textAlign="center">
        {t("csgo.teams.title")}
        <Header.Subheader>{t("csgo.teams.subtitle")}</Header.Subheader>
      </Header>

      <div className="team-list">
        <Card.Group className="item-list">
          {teams.map((team) => (
            <Team key={team.name} team={team} />
          ))}
          <div className="padding-item" />
          <div className="padding-item" />
          <div className="padding-item" />
          <div className="padding-item" />
        </Card.Group>

        <div className="disclaimer">
          <Trans
            i18nKey="csgo:csgo.teams.disclaimer"
            components={[
              <a
                href="https://hltv.com/"
                target="_blank"
                rel="noopener noreferrer"
                key={0}
              />,
              <a
                href="https://liquipedia.net/counterstrike/"
                target="_blank"
                rel="noopener noreferrer"
                key={1}
              />,
            ]}
          />
        </div>
      </div>
    </Container>
  );
};

TeamList.propTypes = {
  teams: PropTypes.array.isRequired,
};

export const getServerSideProps = async () => {
  const { data } = await client.query({
    query: getTeamsQuery,
  });
  return { props: { teams: data.teams.edges.map(({ node }) => node) } };
};

export default TeamList;
