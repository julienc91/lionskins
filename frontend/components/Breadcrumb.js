import React from "react";
import Link from "next/link";
import useTranslation from "next-translate/useTranslation";
import { Breadcrumb as SemanticUIBreadcrumb } from "semantic-ui-react";
import PropTypes from "prop-types";

const Breadcrumb = ({ items }) => {
  const { t } = useTranslation("common");
  return (
    <SemanticUIBreadcrumb>
      <SemanticUIBreadcrumb.Section>
        <Link href="/">
          <a>{t("breadcrumb.home")}</a>
        </Link>
      </SemanticUIBreadcrumb.Section>
      {items.map((item) => [
        <SemanticUIBreadcrumb.Divider key="divider" icon="right angle" />,
        <SemanticUIBreadcrumb.Section key={item.name}>
          {item.link ? (
            <Link href={item.link}>
              <a>{item.name}</a>
            </Link>
          ) : (
            item.name
          )}
        </SemanticUIBreadcrumb.Section>,
      ])}
    </SemanticUIBreadcrumb>
  );
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      link: PropTypes.string,
    })
  ),
};

export default Breadcrumb;
