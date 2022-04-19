import React from 'react'
import PropTypes from 'prop-types'

const MarketplaceLink = ({ href, children }) => {
  return (
    <a href={href} rel='noopener noreferrer' target='_blank'>{children}</a>
  )
}

MarketplaceLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.any
}

export default MarketplaceLink
