import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { v4 as uuid } from 'uuid'
import { StorageManager } from '../utils'

const getFingerprint = () => {
  try {
    let fingerprint = StorageManager.get('src', false)
    if (!fingerprint) {
      fingerprint = uuid()
      StorageManager.set('src', fingerprint, false)
    }
    return fingerprint
  } catch (e) {
    return uuid()
  }
}

const TrackedLink = ({ href, children }) => {
  const [fingerprint, setFingerprint] = useState(null)

  let trackedLink = href
  if (fingerprint) {
    trackedLink += `?src=${fingerprint}`
  }

  useEffect(() => {
    // execute client-side only
    setFingerprint(getFingerprint())
  }, [])

  return (
    <a href={trackedLink} rel='noopener noreferrer' target='_blank'>{children}</a>
  )
}

TrackedLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.any
}

export default TrackedLink
