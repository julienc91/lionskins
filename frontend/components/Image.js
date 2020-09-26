import React, { useState } from 'react'
import PropTypes from 'prop-types'

const Image = ({ loaderSrc, imageSrc, alt, ...props }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const style = {}
  if (!loaded) {
    style.display = 'none'
  }

  return (
    <>
      {(!loaded || error) && <img {...props} src={loaderSrc} alt='' />}
      {!error && (
        <img {...props} alt={alt} src={imageSrc} style={style} onLoad={() => setLoaded(true)} onError={() => setError(true)} />
      )}
    </>
  )
}

Image.propTypes = {
  loaderSrc: PropTypes.string,
  imageSrc: PropTypes.string,
  alt: PropTypes.string.isRequired
}

export default Image
