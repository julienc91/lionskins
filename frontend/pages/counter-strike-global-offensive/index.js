import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroller";
import { Button, Card, Header, Icon, Loader, Sidebar } from "semantic-ui-react";
import Breadcrumb from "../../components/Breadcrumb";
import Changelog from "../../components/Changelog";
import useSettings from "../../components/SettingsProvider";
import Filter from "../../components/csgo/Filter";
import Skin from "../../components/csgo/Skin";

export const getSkinsQuery = gql`
  query (
    $first: Int
    $after: String
    $weapon: String
    $category: String
    $type: String
    $quality: String
    $rarity: String
    $statTrak: Boolean
    $souvenir: Boolean
    $search: String
    $currency: TypeCurrency
    $slug: String
    $group: Boolean
  ) {
    csgo(
      first: $first
      after: $after
      weapon: $weapon
      category: $category
      type: $type
      quality: $quality
      rarity: $rarity
      statTrak: $statTrak
      souvenir: $souvenir
      search: $search
      slug: $slug
      group: $group
    ) {
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

const defaultFilters = {
  category: null,
  rarity: null,
  quality: null,
  search: "",
  souvenir: null,
  statTrak: null,
  type: null,
  weapon: null,
  group: true,
};

const getInitialFilters = (query) => {
  const res = { ...defaultFilters };

  Object.keys(query).forEach((filter) => {
    let value = query[filter];
    if (defaultFilters[filter] !== undefined) {
      if (filter === "search") {
        value = decodeURIComponent(value);
      } else if (value === "true") {
        value = true;
      } else if (value === "false") {
        value = false;
      }
      res[filter] = value;
    }
  });
  return res;
};

const CsgoSkinList = ({ query }) => {
  const { t } = useTranslation("csgo");
  const router = useRouter();
  const { currency } = useSettings();
  const [showSidebar, setShowSidebar] = useState(false);
  const [variables, setVariables] = useState({
    ...getInitialFilters(query),
    first: 30,
    currency,
  });
  const [hasMore, setHasMore] = useState(true);
  const { data, fetchMore, loading } = useQuery(getSkinsQuery, {
    variables,
    notifyOnNetworkStatusChange: true,
  });

  useEffect(
    () => data && data.csgo && setHasMore(data.csgo.pageInfo.hasNextPage),
    [data]
  );
  useEffect(() => updateUrl(), [variables]);
  useEffect(() => {
    setVariables({ ...variables, currency });
  }, [currency]);

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const getMoreSkins = () => {
    if (hasMore) {
      fetchMore({
        variables: {
          ...variables,
          after: data.csgo.pageInfo.endCursor,
        },
      });
    }
  };

  const handleFilterChanged = (value) => {
    setVariables({ ...variables, ...value });
  };

  const updateUrl = () => {
    const params = [];
    Object.keys(variables).forEach((filter) => {
      if (
        defaultFilters[filter] !== undefined &&
        variables[filter] !== undefined &&
        defaultFilters[filter] !== variables[filter]
      ) {
        let value = variables[filter];
        if (filter === "search") {
          value = encodeURIComponent(value);
        }
        params.push(`${filter}=${value}`);
      }
    });
    if (params.length) {
      router.replace(`${router.pathname}?${params.join("&")}`);
    } else {
      router.replace(router.pathname);
    }
  };

  const renderSkins = () => {
    return data.csgo.edges.map(({ node: skin }) => (
      <Skin key={skin.id} skin={skin} />
    ));
  };

  return (
    <div className="skin-list-container">
      <Head>
        <title>{t("csgo.skin_list.page_title")}</title>
      </Head>

      <Sidebar
        className={
          "skin-list-filter-container" + (showSidebar ? " active" : "")
        }
        visible
      >
        <Icon
          name="angle double right"
          className="expand-icon"
          onClick={toggleSidebar}
        />
        <Filter filters={variables} onFilterChanged={handleFilterChanged} />
      </Sidebar>

      <div className="skin-list" onClick={() => setShowSidebar(false)}>
        <Breadcrumb items={[{ name: "Counter-Strike: Global Offensive" }]} />

        <div className="inventory-link">
          <Link href="/counter-strike-global-offensive/my-inventory" passHref>
            <Button primary icon labelPosition="left">
              <Icon name="steam" />
              {t("csgo.skin_list.inventory_link")}
            </Button>
          </Link>
        </div>

        <Changelog />

        {!loading && data && data.csgo && data.csgo.edges.length === 0 && (
          <Header as="h2" icon className="no-results">
            <Icon name="frown outline" />
            {t("skin_list:skin_list.no_results.title")}
            <Header.Subheader>
              {t("skin_list:skin_list.no_results.subtitle")}
            </Header.Subheader>
          </Header>
        )}

        {data && data.csgo && !!data.csgo.edges.length && (
          <InfiniteScroll
            initialLoad={false}
            hasMore={hasMore}
            loadMore={getMoreSkins}
          >
            <Card.Group className="item-list">
              {renderSkins()}
              <div className="padding-item" />
              <div className="padding-item" />
              <div className="padding-item" />
              <div className="padding-item" />
              <div className="padding-item" />
            </Card.Group>
          </InfiniteScroll>
        )}

        {loading && <Loader active inline="centered" key="loader" />}
      </div>
    </div>
  );
};

CsgoSkinList.propTypes = {
  query: PropTypes.object,
};

export const getServerSideProps = async ({ query }) => ({
  props: {
    query,
  },
});

export default CsgoSkinList;
