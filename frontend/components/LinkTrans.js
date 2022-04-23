import React from "react";
import Link from "next/link";
import PropTypes from "prop-types";

// https://github.com/i18next/react-i18next/issues/1090

const LinkTrans = ({ children, href }) => (
  <Link href={href}>
    <a>{children}</a>
  </Link>
);

LinkTrans.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};

export default LinkTrans;
