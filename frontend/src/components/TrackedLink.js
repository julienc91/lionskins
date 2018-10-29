import React, { Component } from 'react'
import PropTypes from 'prop-types'
import uuid from 'uuid/v4'

class TrackedLink extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fingerprint: TrackedLink.getFingerprint()
    }
  }

  static getFingerprint () {
    let fingerprint = sessionStorage.getItem('src')
    if (!fingerprint) {
      fingerprint = uuid()
      sessionStorage.setItem('src', fingerprint)
    }
    return fingerprint
  }

  render () {
    const { fingerprint } = this.state
    const { href, children } = this.props
    const trackedLink = `${href}?src=${fingerprint}`
    return (
      <a href={trackedLink} target='_blank'>{children}</a>
    )
  }
}

TrackedLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.any
}

export default TrackedLink
