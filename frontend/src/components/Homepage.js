import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Image, Header } from 'semantic-ui-react'
import Slider from 'react-slick'

import logo from '../assets/images/logo.svg'
import csgoCarousel from '../assets/images/carousel/csgo.jpg'
import pubgCarousel from '../assets/images/carousel/pubg.jpg'
import dota2Carousel from '../assets/images/carousel/dota2.jpg'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'

class Homepage extends Component {
  componentDidMount () {
    document.title = 'Lion Skins - Compare prices of thousands of skins'
  }

  render () {
    return (
      <div className='homepage'>
        <Image src={logo} alt='' className='logo' />
        <Header as='h1'>Lion Skins</Header>
        <Header as='h2'>
          Compare prices of thousands of skins<br />
          among the most trusted marketplaces
        </Header>
        <Carousel />
      </div>
    )
  }
}

export default Homepage

class Carousel extends Component {
  render () {
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
            label={{ content: 'Soon', ribbon: true }} />
        </div>
        <div className='soon'>
          <Image src={dota2Carousel} alt='Dota 2' label={{ content: 'Soon', ribbon: true }} />
        </div>
      </Slider>
    )
  }
}
