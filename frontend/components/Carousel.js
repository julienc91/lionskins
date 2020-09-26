import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import Slider from 'react-slick'
import { Image } from 'semantic-ui-react'
import { Link } from '../i18n'
import carouselImagesData from '../assets/data/carousel'

const Carousel = ({ images }) => {
  const [dragging, setDragging] = useState(false)

  const handleClick = useCallback(e => {
    if (dragging) {
      e.preventDefault()
    }
  }, [dragging])

  const settings = {
    autoplay: true,
    dots: false,
    infinite: true,
    slidesToShow: 3,
    lazyLoad: false,
    beforeChange: () => setDragging(true),
    afterChange: () => setDragging(false),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  }

  const slides = images.map((name, i) => (
    <div key={i}>
      <Link href={carouselImagesData[name].link} onClick={handleClick}>
        <a><Image src={`/images/carousel/${name}.jpg`} alt={carouselImagesData[name].name} /></a>
      </Link>
    </div>
  ))

  return (
    <Slider {...settings} className='carousel'>
      {slides}
    </Slider>
  )
}

Carousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default Carousel
