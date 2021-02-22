import React from 'react'
import PropTypes from 'prop-types'
import SwiperCore, { Autoplay } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Image } from 'semantic-ui-react'
import { Link } from '../i18n'
import carouselImagesData from '../assets/data/carousel'

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

  const slides = images.map((name, i) => (
    <SwiperSlide key={i}>
      <Link href={carouselImagesData[name].link}>
        <a>
          <Image src={`/images/carousel/${name}.jpg`} alt={carouselImagesData[name].name} />
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
  images: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default Carousel
