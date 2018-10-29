import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Container, Header } from 'semantic-ui-react'
import Breadcrumb from './Breadcrumb'

class PrivacyPolicy extends Component {
  breadcrumb = [
    { 'name': 'Privacy Policy' }
  ]

  componentDidMount () {
    document.title = 'Lion Skins - Privacy Policy'
  }

  render () {
    return (
      <Container className='page privacy-policy'>
        <Breadcrumb items={this.breadcrumb} />

        <Header as='h1' textAlign='center'>
          Privacy Policy
          <Header.Subheader>Because we value your privacy</Header.Subheader>
        </Header>

        <Container>

          <Header as='h2'>Who we are</Header>

          <p>Lion Skins was made by gamers and for gamers. We are pleased
            to see you use our service, and you can be sure that we will
            never use any of your personal data for profit or for anything
            that does not involve a better user experience.</p>

          <p>If you have any question regarding this privacy policy, feel
            free to <Link to='/contact/'>contact us</Link>.</p>

          <Header as='h2'>What we collect</Header>

          <p>Not much actually...</p>

          <ul>
            <li><strong>Your e-mail address</strong>: only if you want to
              contact us from the contact form and expect an answer</li>
            <li><strong>Your clicks on links to marketplaces' websites</strong>:
              everytime you click on one of the links that redirects you to a
              skin marketplace, we generate a unique and totally random id in
              order to have a rough idea of how our visitors interact with the
              marketplaces we suggest. This id is automatically deleted at the
              end of your visit, and cannot be linked back to your device or your
              person.
            </li>
          </ul>

          <Header as='h2'>Third party services we use</Header>

          <p>We also use third-party services to make our site work
            like we want it to. Here's the list:</p>
          <ul>
            <li><a href='https://matomo.org/' target='_blank' rel='noopener noreferrer'>
              Matomo</a>: an open-source analytics platform that is known for being
              especially privacy-protection friendly. We need this tool to
              know how our visitors interact with our service in order to
              continuously improve their experience
            </li>
            <li><a href='https://www.google.com/recaptcha/' target='_blank' rel='noopener noreferrer'>
              Recaptcha</a>: Google's captcha solution. This is only used on the
              contact form to prevent spam
            </li>
          </ul>

        </Container>
      </Container>
    )
  }
}

export default PrivacyPolicy
