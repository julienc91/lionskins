import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import Head from "next/head";
import useTranslation from "next-translate/useTranslation";
import PropTypes from "prop-types";
import { Container, Header, Loader } from "semantic-ui-react";
import Page404 from "../../404";
import Breadcrumb from "../../../components/Breadcrumb";
import useSettings from "../../../components/SettingsProvider";
import SkinSummary from "../../../components/csgo/SkinSummary";
import SkinPrices from "../../../components/csgo/SkinPrices";
import { getWeaponSlug } from "../../../utils/csgo/utils";
import { Providers } from "../../../utils/enums";
import { Qualities, Weapons } from "../../../utils/csgo/enums";
import Image from "../../../components/Image";

const getSkinQuery = gql`
  query (
    $weapon: String
    $slug: String
    $currency: TypeCurrency
    $category: String
    $type: String
    $quality: String
    $rarity: String
    $statTrak: Boolean
    $souvenir: Boolean
    $search: String
  ) {
    csgo(
      weapon: $weapon
      slug: $slug
      category: $category
      type: $type
      quality: $quality
      rarity: $rarity
      statTrak: $statTrak
      souvenir: $souvenir
      search: $search
    ) {
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
          collection
          description {
            en
            fr
          }
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

const SkinPage = ({ category, slug, weapon }) => {
  const { t } = useTranslation("csgo");
  const { currency } = useSettings();

  const variables = { currency, slug };
  if (weapon) {
    variables.weapon = weapon;
  } else {
    variables.type = category;
  }
  const { data, loading } = useQuery(getSkinQuery, {
    variables,
    notifyOnNetworkStatusChange: true,
  });
  const [quality, setQuality] = useState(Object.keys(Qualities)[0]);

  if (!loading && (!data || !data.csgo.edges.length)) {
    return <Page404 />;
  } else if (loading) {
    return (
      <Container>
        <Loader active inline="centered" key="loader" />
      </Container>
    );
  }

  const skins = data.csgo.edges.map(({ node }) => node);
  const skin = skins[0];
  const weaponName = weapon ? t(Weapons[skin.weapon.name]) : "";
  const description = skin.description[t("common:current_language")];
  const skinName =
    weapon && skin.quality === "vanilla"
      ? t("csgo.qualities.vanilla")
      : skin.name;
  const fullName = weapon ? `${weaponName} - ${skinName}` : skin.name;
  const hasStatTrak = skins.some((s) => s.statTrak);
  const hasSouvenir = skins.some((s) => s.souvenir);

  let qualities;
  if (skin.quality === "vanilla") {
    qualities = ["vanilla"];
  } else {
    qualities = Object.keys(Qualities).filter((q) => q !== "vanilla");
  }

  const defaultSkin = weapon
    ? skins.find((s) => s.quality === quality && s.imageUrl)
    : skins[0];
  const defaultImage = `/images/csgo/weapons/default_skin_${
    weapon ? skin.weapon.name : category
  }.png`;
  const image =
    defaultSkin && defaultSkin.imageUrl ? defaultSkin.imageUrl : defaultImage;

  const allPrices = [];
  skins.forEach((skin) => {
    Object.keys(Providers).forEach((provider) => {
      if (skin.prices && skin.prices[provider]) {
        allPrices.push(skin.prices[provider]);
      }
    });
  });

  return (
    <Container className="skin-page">
      <Head>
        <title>{`${t("csgo.skin.page_title")} - ${fullName}`}</title>
      </Head>

      <Breadcrumb
        items={[
          {
            name: "Counter-Strike: Global Offensive",
            link: "/counter-strike-global-offensive/",
          },
          { name: weapon ? weaponName : t(`csgo.types.${category}`) },
          { name: skinName },
        ]}
      />
      <Header as="h1">{fullName}</Header>

      <div className="main-content">
        <div className="description">{description}</div>

        <div className="panels">
          <section className="left-panel">
            <Header as="h3" key="header">
              {t("csgo.skin.summary")}
            </Header>
            <SkinSummary skins={skins} />

            <div>
              <div className="skin-image">
                <Image
                  alt={fullName}
                  imageSrc={image}
                  loaderSrc={defaultImage}
                />
              </div>

              {weapon && (
                <div className="select-quality">
                  {qualities.map((key) => (
                    <div
                      key={key}
                      className={quality === key ? "active" : ""}
                      onClick={() => setQuality(key)}
                    >
                      {t(Qualities[key])}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="right-panel">
            <div className="skin-prices">
              <Header as="h3">
                {hasStatTrak || hasSouvenir
                  ? t("csgo.skin.vanilla")
                  : t("csgo.skin.prices")}
              </Header>
              <SkinPrices skins={skins} statTrak={false} souvenir={false} />

              {hasStatTrak && [
                <Header as="h3" key="header">
                  {t("csgo.skin.stat_trak")}
                </Header>,
                <SkinPrices
                  skins={skins}
                  statTrak
                  souvenir={false}
                  key="prices"
                />,
              ]}
              {hasSouvenir && [
                <Header as="h3" key="header">
                  {t("csgo.skin.souvenir")}
                </Header>,
                <SkinPrices
                  skins={skins}
                  statTrak={false}
                  souvenir
                  key="prices"
                />,
              ]}
            </div>
          </section>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: `${weaponName} - ${skinName}`,
            image,
            description,
            offers: {
              "@type": "AggregateOffer",
              offerCount: allPrices.length,
              lowPrice: Math.min(...allPrices),
              highPrice: Math.max(...allPrices),
              priceCurrency: currency,
            },
          }),
        }}
      />
    </Container>
  );
};

SkinPage.propTypes = {
  category: PropTypes.string,
  slug: PropTypes.string.isRequired,
  weapon: PropTypes.string,
};

export const getServerSideProps = async ({ query }) => {
  const slug = query.slug;

  let category;
  const weapon =
    Object.keys(Weapons).find((e) => getWeaponSlug(e) === query.category) ||
    null;
  if (!weapon) {
    category = query.category.replace("-", "_");
  } else {
    category = "weapons";
  }

  if (!category || !slug) {
    return { notFound: true };
  }

  return {
    props: {
      category,
      weapon,
      slug,
    },
  };
};

export default SkinPage;
