import React from "react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { Container, Header, Icon, Button } from "semantic-ui-react";

const Page404 = () => {
  const { t } = useTranslation("common");
  return (
    <Container>
      <Header as="h1" icon className="no-results">
        <Icon name="frown outline" />
        {t("404.title")}
        <Header.Subheader>{t("404.subtitle")}</Header.Subheader>
        <Header.Subheader>
          <Link href="/">
            <Button primary>{t("404.homepage")}</Button>
          </Link>
        </Header.Subheader>
      </Header>
    </Container>
  );
};

export default Page404;
