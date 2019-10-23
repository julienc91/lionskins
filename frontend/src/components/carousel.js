import React from 'react'
import Slider from 'react-slick'
import { Link } from 'react-router-dom'
import { Image } from 'semantic-ui-react'
import { importAll } from '../tools'

const carouselImages = importAll(require.context('../assets/images/carousel/', false, /.jpg/))
const carouselImagesData = {
  ak_47_neon_revolution: {
    link: '/counter-strike-global-offensive/ak-47/neon-revolution/',
    name: 'AK-47 - Neon Revolution'
  },
  ak_47_uncharted: {
    link: '/counter-strike-global-offensive/ak-47/uncharted/',
    name: 'AK-47 - Uncharted'
  },
  awp_asiimov: {
    link: '/counter-strike-global-offensive/awp/asiimov/',
    name: 'AWP - Asiimov'
  },
  cz75_auto_eco: {
    link: '/counter-strike-global-offensive/cz75-auto/eco/',
    name: 'CZ75-Auto - Eco'
  },
  desert_eagle_mecha_industries: {
    link: '/counter-strike-global-offensive/desert-eagle/mecha-industries/',
    name: 'Desert Eagle - Mecha Industries'
  },
  m4a4_neo_noir: {
    link: '/counter-strike-global-offensive/m4a4/neo-noir/',
    name: 'M4A4 - Neo-Noir'
  },
  mac_10_neon_rider: {
    link: '/counter-strike-global-offensive/mac-10/neon-rider/',
    name: 'MAC-10 - Neon Rider'
  },
  p90_nostalgia: {
    link: '/counter-strike-global-offensive/p90/nostalgia/',
    name: 'P90 - Nostalgia'
  },
  sawed_off_devourer: {
    link: '/counter-strike-global-offensive/sawed-off/devourer/',
    name: 'Sawed-Off - Devourer'
  },
  ump_45_moonrise: {
    link: '/counter-strike-global-offensive/ump-45/moonrise/',
    name: 'UMP-45 - Moonrise'
  },
  usp_s_cortex: {
    link: '/counter-strike-global-offensive/usp-s/cortex/',
    name: 'USP-S - Cortex'
  }
}

class Carousel extends React.Component {
  constructor (props) {
    super(props)
    const images = Carousel.shuffle(Object.keys(carouselImagesData)).slice(0, 10)

    this.state = {
      dragging: false,
      images
    }

    this.handleClick = this.handleClick.bind(this)
    this.setDrag = this.setDrag.bind(this)
  }

  handleClick (event) {
    const { dragging } = this.state
    if (dragging) {
      event.preventDefault()
    }
  }

  setDrag (dragging) {
    this.setState({ dragging })
  }

  static shuffle (array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  render () {
    const settings = {
      autoplay: true,
      dots: false,
      infinite: true,
      slidesToShow: 3,
      lazyLoad: false,
      beforeChange: () => this.setDrag(true),
      afterChange: () => this.setDrag(false),
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

    const { images } = this.state
    const slides = images.map((name, i) => (
      <div key={i}>
        <Link to={carouselImagesData[name].link} onClick={this.handleClick}>
          <Image src={carouselImages[`${name}.jpg`]} alt={carouselImagesData[name].name} />
        </Link>
      </div>
    ))

    return (
      <Slider {...settings} className='carousel'>
        {slides}
      </Slider>
    )
  }
}

export default Carousel
