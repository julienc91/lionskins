import React from 'react'
import PropTypes from 'prop-types'
import { Link } from '../i18n'

// https://github.com/i18next/react-i18next/issues/1090

const LinkTrans = ({ children, href }) => (
  <Link href={href}><a>{children}</a></Link>
)

LinkTrans.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired
}

export default LinkTrans
