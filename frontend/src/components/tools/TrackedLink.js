import React, { Component } from 'react'
import PropTypes from 'prop-types'
import uuid from 'uuid/v4'
import { StorageManager } from '../../tools'

class TrackedLink extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fingerprint: TrackedLink.getFingerprint()
    }
  }

  static getFingerprint () {
    try {
      let fingerprint = StorageManager.get('src', false)
      if (!fingerprint) {
        fingerprint = uuid()
        StorageManager.set('src', fingerprint)
      }
      return fingerprint
    } catch (e) {
      return uuid()
    }
  }

  render () {
    const { fingerprint } = this.state
    const { href, children } = this.props
    const trackedLink = `${href}?src=${fingerprint}`
    return (
      <a href={trackedLink} rel='noopener noreferrer' target='_blank'>{children}</a>
    )
  }
}

TrackedLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.any
}

export default TrackedLink
