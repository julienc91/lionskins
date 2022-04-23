import React from "react";
import NextHead from "next/head";
import { useRouter } from "next/router";
import useTranslation from "next-translate/useTranslation";

const Head = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const locales = router.locales;
  const path = router.asPath.split("?")[0].slice(4);
  return (
    <NextHead>
      {locales
        .filter((locale) => locale !== "default")
        .map((locale) => (
          <link
            key={`alternate-${locale}`}
            rel="alternate"
            hrefLang={locale}
            href={`${process.env.NEXT_PUBLIC_FRONTEND_DOMAIN}/${locale}/${path}`}
          />
        ))}
      <meta
        key="description"
        name="description"
        content={t("head.description")}
      />
    </NextHead>
  );
};

export default Head;
