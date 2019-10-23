import React from 'react'
import Slider from 'react-slick/lib'
import { Link } from 'react-router-dom'
import { Image } from 'semantic-ui-react'
import csgoCarousel from '../assets/images/carousel/csgo.jpg'
import pubgCarousel from '../assets/images/carousel/pubg.jpg'
import dota2Carousel from '../assets/images/carousel/dota2.jpg'
import { withTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

class Carousel extends React.Component {
  render () {
    const { t } = this.props
    const settings = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 3,
      slidesToScroll: 1,
      swipeToSlide: true,
      lazyLoad: true,
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
    return (
      <Slider {...settings} className='carousel'>
        <div>
          <Link to='/counter-strike-global-offensive/'>
            <Image src={csgoCarousel} alt='Counter-Strike: Global Offensive' />
          </Link>
        </div>
        <div className='soon'>
          <Image
            src={pubgCarousel} alt="PlayerUnknown's Battlegrounds"
            label={{ content: t('carousel.soon'), ribbon: true }}
          />
        </div>
        <div className='soon'>
          <Image src={dota2Carousel} alt='Dota 2' label={{ content: t('carousel.soon'), ribbon: true }} />
        </div>
      </Slider>
    )
  }
}

Carousel.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(Carousel)
