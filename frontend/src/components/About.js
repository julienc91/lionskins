import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Container, Header } from 'semantic-ui-react'
import Breadcrumb from './Breadcrumb'

class About extends Component {
  breadcrumb = [
    { 'name': 'About' }
  ]

  componentDidMount () {
    document.title = 'Lion Skins - About'
  }

  render () {
    return (
      <Container className='page about'>
        <Breadcrumb items={this.breadcrumb} />

        <Header as='h1' textAlign='center'>
          About
          <Header.Subheader>Let's get to know each other</Header.Subheader>
        </Header>

        <Container>

          <Header as='h2'>Who we are</Header>

          <p>Lion Skins was made by gamers and for gamers.</p>

          <p>The purpose of our service is to provide easy access to
            trusted marketplaces for you to buy the skins of your dreams
            for your favorite video games at the best price available.</p>

          <p>We are not affiliated to any of the marketplaces we suggest,
            we just consider them to be trustworthy.</p>

          <p>If you have any question, don't hesite to drop us a message
            from the <Link to='/contact/'>contact form</Link>!</p>

        </Container>
      </Container>
    )
  }
}

export default About
