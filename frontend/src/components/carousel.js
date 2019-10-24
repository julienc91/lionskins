import React from 'react'
import Slider from 'react-slick'
import { Link } from 'react-router-dom'
import { Image } from 'semantic-ui-react'
import { importAll } from '../tools'
import carouselImagesData from '../assets/data/carousel'

const carouselImages = importAll(require.context('../assets/images/carousel/', false, /.jpg/))

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
