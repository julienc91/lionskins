import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { Container, Header, Form, Button, Loader, Message } from 'semantic-ui-react'
import { withTranslation } from 'react-i18next'
import ReCAPTCHA from 'react-google-recaptcha'
import { Mutation } from 'react-apollo'
import Breadcrumb from '../components/tools/Breadcrumb'
import PropTypes from 'prop-types'
import { contactQuery } from '../api/contact'

const STATE_NOT_SENT = 0
const STATE_SENDING = 1
const STATE_SENT = 2

class Contact extends Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      message: '',
      captcha: null,
      state: STATE_NOT_SENT,
      error: false
    }
    this.captcha = React.createRef()
    this.handleCaptchaChanged = this.handleCaptchaChanged.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleError = this.handleError.bind(this)
    this.handleCompleted = this.handleCompleted.bind(this)
  }

  componentDidMount () {
    this.captcha.current.execute()
  }

  handleCaptchaChanged (value) {
    this.setState({
      captcha: value
    }, () => {
      if (!value) {
        this.captcha.current.execute()
      }
    })
  }

  handleSubmit (e, contact) {
    e.preventDefault()
    const { name, email, message, captcha } = this.state
    if (!captcha) {
      this.captcha.current.execute()
    } else {
      this.setState({
        state: STATE_SENDING
      }, () => {
        contact({ variables: { name, email, message, captcha } })
      })
    }
  }

  handleError () {
    this.setState({
      state: STATE_NOT_SENT,
      error: true
    })
  }

  handleCompleted () {
    this.setState({
      name: '',
      email: '',
      message: '',
      state: STATE_SENT,
      error: false
    })
  }

  render () {
    const { t } = this.props
    const { name, email, message, state, error } = this.state

    return (
      <Container className='page contact-form'>
        <Helmet
          title={t('contact.page_title')}
        />

        <Breadcrumb items={[{ name: t('contact.breadcrumb') }]} />
        <Header as='h1' textAlign='center'>
          {t('contact.title')}
          <Header.Subheader>{t('contact.subtitle1')}<br />{t('contact.subtitle2')}</Header.Subheader>
        </Header>

        <Container>
          <Mutation mutation={contactQuery} onError={this.handleError} onCompleted={this.handleCompleted}>
            {(contact) => {
              if (state === STATE_SENT) {
                return (
                  <Message positive>
                    <Message.Header>{t('contact.success.title')}</Message.Header>
                    <p>{t('contact.success.content')}</p>
                  </Message>
                )
              } else if (state === STATE_SENDING) {
                return <Loader active inline='centered' />
              } else {
                return (
                  <Form onSubmit={(e) => this.handleSubmit(e, contact)}>
                    {error &&
                    <Message negative>
                      <Message.Header>{t('contact.error.title')}</Message.Header>
                      <p>{t('contact.error.content')}</p>
                    </Message>}
                    <Form.Input
                      label={t('contact.name_label')} value={name}
                      onChange={(e) => this.setState({ name: e.target.value })} />
                    <Form.Input
                      label={t('contact.email_label')} type='email' value={email}
                      onChange={(e) => this.setState({ email: e.target.value })} />
                    <Form.TextArea
                      label={t('contact.message_label')} minLength={50} maxLength={10000} required value={message}
                      onChange={(e) => this.setState({ message: e.target.value })} />
                    <ReCAPTCHA
                      ref={this.captcha}
                      sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                      size='invisible' badge='inline'
                      onChange={this.handleCaptchaChanged}
                    />
                    <Button type='submit'>{t('contact.submit')}</Button>
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

Contact.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(Contact)
