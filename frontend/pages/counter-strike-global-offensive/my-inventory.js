import React, { useEffect, useState } from "react";
import { gql, useLazyQuery } from "@apollo/client";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import { Container, Header, Icon, Loader } from "semantic-ui-react";
import useAuth from "../../components/AuthenticationProvider";
import Breadcrumb from "../../components/Breadcrumb";
import useSettings from "../../components/SettingsProvider";
import AuthenticationManager from "../../utils/authentication";
import { formatPrice } from "../../utils/i18n";
import SkinList from "../../components/csgo/SkinList";

export const getInventoryQuery = gql`
  query ($first: Int, $after: String, $currency: TypeCurrency) {
    inventoryCost(currency: $currency)
    inventory(first: $first, after: $after) {
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

const MyInventory = () => {
  const { t, lang } = useTranslation("csgo");
  const { currency } = useSettings();
  const [hasMore, setHasMore] = useState(true);
  const [variables, setVariables] = useState({ first: 30, currency });
  const { user, loading: userLoading } = useAuth();

  const [loadInventory, { data, fetchMore, loading: dataLoading }] =
    useLazyQuery(getInventoryQuery, {
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

  useEffect(() => setVariables((v) => ({ ...v, currency })), [currency]);

  useEffect(
    () =>
      data && data.inventory && setHasMore(data.inventory.pageInfo.hasNextPage),
    [data]
  );

  useEffect(() => {
    if (user) {
      loadInventory();
    }
  }, [user, currency]);

  const inventoryCost = data?.inventoryCost;
  const skins = (data?.inventory?.edges || []).map(({ node }) => node);
  const handleStartLogin = AuthenticationManager.startOpenId;

  return (
    <Container className="page inventory">
      <Head>
        <title>{t("csgo.inventory.page_title")}</title>
      </Head>

      <Breadcrumb
        items={[
          {
            name: "Counter-Strike: Global Offensive",
            link: "/counter-strike-global-offensive/",
          },
          { name: t("csgo.inventory.breadcrumb") },
        ]}
      />

      <Header as="h1" textAlign="center">
        {t("csgo.inventory.title")}
      </Header>

      {(userLoading || (dataLoading && !data)) && (
        <Loader active inline="centered" key="loader" />
      )}

      {!userLoading && !user && (
        <Header as="h2" icon textAlign="center">
          <Icon name="steam symbol" />
          {t("csgo.inventory.sign_in_title")}
          <Header.Subheader>
            {t("csgo.inventory.sign_in_subtitle")}
          </Header.Subheader>
          <span onClick={handleStartLogin} style={{ cursor: "pointer" }}>
            <img
              alt={t("csgo.inventory.steam_login")}
              src="/images/steam_openid.png"
            />
          </span>
        </Header>
      )}

      {user && !dataLoading && !skins.length && (
        <Header as="h2" icon textAlign="center">
          <Icon name="frown outline" />
          {t("csgo.inventory.no_results_title")}
          <Header.Subheader>
            {t("csgo.inventory.no_results_subtitle")}
          </Header.Subheader>
        </Header>
      )}

      {user && skins.length && (
        <>
          <Header as="h2" icon textAlign="center">
            <Icon name={currency} />
            {formatPrice(inventoryCost, lang)}
            <br />
            {t("csgo.inventory.summary_title")}
            <Header.Subheader>
              {t("csgo.inventory.summary_subtitle")}
            </Header.Subheader>
          </Header>

          <div className="skin-list">
            <SkinList
              hasMore={hasMore}
              loading={dataLoading}
              getMoreSkins={getMoreSkins}
              skins={skins}
            />
          </div>
        </>
      )}
    </Container>
  );
};

export default MyInventory;
