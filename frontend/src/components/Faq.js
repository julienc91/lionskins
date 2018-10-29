import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Container, Header } from 'semantic-ui-react'
import Breadcrumb from './Breadcrumb'

class About extends Component {
  breadcrumb = [
    { 'name': 'About' }
  ]

  componentDidMount () {
    document.title = 'Lion Skins - FAQ'
  }

  render () {
    return (
      <Container className='page faq'>
        <Breadcrumb items={this.breadcrumb} />

        <Header as='h1' textAlign='center'>
          FAQ
          <Header.Subheader>Any question?</Header.Subheader>
        </Header>

        <Container>

          <Header as='h2'>Why don't you propose game <em>X</em>?</Header>

          <p>We'll try to add new games progressively, but it takes time!</p>

          <Header as='h2'>Why don't you propose marketplace <em>X</em>?</Header>

          <p>We're sure that this service is super great, but we cannot include
            every marketplace that exists. But maybe if you are numerous enough to
            suggest this, we'll have a look one day or another!</p>

          <Header as='h2'>The price you showed was not right!</Header>

          <p>Even though we aim for real-time pricing updates, we are
            technically not able to do so at the moment; which is why you
            may notice inconsistencies between the prices we show and the
            effective prices in the marketplaces.</p>

          <Header as='h2'>Are you affiliated with <em>X</em> or <em>Y</em>?</Header>

          <p>No, we're not.</p>

          <Header as='h2'>Can I suggest you something?</Header>

          <p>We'd love to hear about your ideas so that we make
            Lion Skins better! Drop us a message from
            the <Link to='/contact/'>contact form</Link>.</p>

        </Container>
      </Container>
    )
  }
}

export default About
