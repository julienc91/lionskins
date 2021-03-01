import React from 'react'
import Link from 'next/link'
import PropTypes from 'prop-types'
import SwiperCore, { Autoplay } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Image } from 'semantic-ui-react'

SwiperCore.use([Autoplay])

const Carousel = ({ images }) => {
  const settings = {
    autoplay: {
      delay: 2500
    },
    loop: true,
    slidesPerView: 1,
    breakpoints: {
      640: {
        slidesPerView: 2
      },
      1024: {
        slidesPerView: 3
      },
      2048: {
        slidesPerView: 4
      }
    }
  }

  const slides = images.map(image => (
    <SwiperSlide key={image.id}>
      <Link href={image.link}>
        <a>
          <Image src={`/images/carousel/${image.id}.jpg`} alt={image.name} />
        </a>
      </Link>
    </SwiperSlide>
  ))

  return (
    <Swiper {...settings} className='carousel'>
      {slides}
    </Swiper>
  )
}

Carousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired
  })).isRequired
}

export default Carousel
