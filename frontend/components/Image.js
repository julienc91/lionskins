import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'

const Image = ({ loaderSrc, imageSrc, alt, ...props }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const img = useRef(null)

  const style = {}
  if (!loaded) {
    style.display = 'none'
  }

  useEffect(() => {
    // case when the image is already loaded when the component is mounted
    if (img.current?.complete) {
      // workaround to identify missing images...
      setLoaded(img.current.height > 30)
    }
  }, [])

  const setLoaded_ = () => {
    console.log(imageSrc, 'loaded')
    setLoaded(true)
  }

  const setError_ = () => {
    console.log(imageSrc, 'error')
    setError(true)
  }

  return (
    <>
      {(!loaded || error) && <img {...props} src={loaderSrc} alt='' />}
      {!error && (
        <img {...props} alt={alt} ref={img} src={imageSrc} style={style} onLoad={() => setLoaded_(true)} onError={() => setError_(true)} />
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
