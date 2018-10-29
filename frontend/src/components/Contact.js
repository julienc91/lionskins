import React, { Component } from 'react'
import { Container, Header, Form, Button, Loader, Message } from 'semantic-ui-react'
import ReCAPTCHA from 'react-google-recaptcha'
import gql from 'graphql-tag'
import { Mutation } from 'react-apollo'
import Breadcrumb from './Breadcrumb'

class Contact extends Component {
  breadcrumb = [
    { 'name': 'Contact' }
  ]
  query = gql`
  mutation contact($name: String, $email: String, $message: String!, $captcha: String!) {
    contact(name: $name, email: $email, message: $message, captcha: $captcha) {
      id 
    }
  }
  `

  STATE_NOT_SENT = 0
  STATE_SENDING = 1
  STATE_SENT = 2

  constructor (props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      message: '',
      captcha: null,
      state: this.STATE_NOT_SENT,
      error: false
    }
    this.captcha = undefined
    this.handleCaptchaChanged = this.handleCaptchaChanged.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleError = this.handleError.bind(this)
    this.handleCompleted = this.handleCompleted.bind(this)
  }

  componentDidMount () {
    document.title = 'Lion Skins - Contact us'
    this.captcha && this.captcha.execute()
  }

  handleCaptchaChanged (value) {
    this.setState({
      captcha: value
    }, () => {
      if (!value && this.captcha) {
        this.captcha.execute()
      }
    })
  }

  handleSubmit (e, contact) {
    e.preventDefault()
    const { name, email, message, captcha } = this.state
    if (!captcha) {
      this.captcha.execute()
    } else {
      this.setState({
        state: this.STATE_SENDING
      }, () => {
        contact({ variables: { name, email, message, captcha } })
      })
    }
  }

  handleError () {
    this.setState({
      state: this.STATE_NOT_SENT,
      error: true
    })
  }

  handleCompleted () {
    this.setState({
      name: '',
      email: '',
      message: '',
      state: this.STATE_SENT,
      error: false
    })
  }

  render () {
    const { name, email, message, state, error } = this.state

    return (
      <Container className='page contact-form'>
        <Breadcrumb items={this.breadcrumb} />
        <Header as='h1' textAlign='center'>
          Contact Us
          <Header.Subheader>A question? A suggestion?<br />Feel free to contact us!</Header.Subheader>
        </Header>

        <Container>
          <Mutation mutation={this.query} onError={this.handleError} onCompleted={this.handleCompleted}>
            {(contact) => {
              if (state === this.STATE_SENT) {
                return (
                  <Message positive>
                    <Message.Header>Your message has been sent</Message.Header>
                    <p>Have a nice day!</p>
                  </Message>
                )
              } else if (state === this.STATE_SENDING) {
                return <Loader active inline='centered' />
              } else {
                return (
                  <Form onSubmit={(e) => this.handleSubmit(e, contact)}>
                    {error &&
                    <Message negative>
                      <Message.Header>Something went wrong...</Message.Header>
                      <p>Your message was not sent, sorry for that. Can you try one more time?</p>
                    </Message>}
                    <Form.Input
                      label='Your name, alias, or whatever you want to be called' value={name}
                      onChange={(e) => this.setState({ name: e.target.value })} />
                    <Form.Input
                      label='Your email address, if you want us to get back to you' type='email' value={email}
                      onChange={(e) => this.setState({ email: e.target.value })} />
                    <Form.TextArea
                      label='Your message' minLength={50} maxLength={10000} required value={message}
                      onChange={(e) => this.setState({ message: e.target.value })} />
                    <ReCAPTCHA
                      ref={(el) => { this.captcha = el }}
                      sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                      size='invisible' badge='inline'
                      onChange={this.handleCaptchaChanged}
                    />
                    <Button type='submit'>Submit</Button>
                  </Form>
                )
              }
            }}
          </Mutation>

        </Container>
      </Container>
    )
  }
}

export default Contact
