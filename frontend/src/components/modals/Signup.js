import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { Button, Form, Message, Modal } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Mutation } from 'react-apollo'
import * as actions from '../../actions'
import gql from 'graphql-tag'
import client from '../../apollo'
import ReCAPTCHA from 'react-google-recaptcha'

class SignupModal extends Component {
  query = gql`
  mutation($username: String!, $password: String!, $captcha: String!) {
    createUser(username: $username, password: $password, captcha: $captcha) {
      accessToken,
      refreshToken
    }
  }
  `

  getUserQuery = gql`
    query {
      currentUser {
        id,
        username
      }
    }
  `

  constructor (props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      showPassword: false,
      captcha: null
    }
    this.captcha = React.createRef()
    this.mutation = null
    this.handleCaptchaChanged = this.handleCaptchaChanged.bind(this)
    this.handleCompleted = this.handleCompleted.bind(this)
    this.handleShowPassword = this.handleShowPassword.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleCaptchaChanged (value) {
    this.setState({
      captcha: value
    }, () => {
      if (value && this.mutation) {
        this.mutation()
      }
    })
  }

  handleShowPassword () {
    this.setState({
      showPassword: !this.state.showPassword
    })
  }

  handleSubmit (e, mutation) {
    e.preventDefault()
    this.mutation = () => mutation(e)
    if (this.state.captcha) {
      this.mutation()
    } else {
      this.captcha.current.execute()
    }
  }

  handleCompleted (res) {
    const { setAccessToken, setRefreshToken, setUser } = this.props
    console.log(res)
    const { accessToken, refreshToken } = res.createUser
    setRefreshToken(refreshToken)
    setAccessToken(accessToken)
    client.query({
      query: this.getUserQuery
    }).then(response => {
      const user = response.data.currentUser
      setUser(user)
    })
  }

  renderError (error) {
    const { t } = this.props
    if (!error) {
      return null
    }
    let errorMessage = t('signup.error.default_error')
    const errorCode = error.graphQLErrors && error.graphQLErrors[0].code
    const errorField = error.graphQLErrors && error.graphQLErrors[0].field
    switch (errorCode + '|' + errorField) {
      case '400|password':
        errorMessage = t('signup.error.invalid_password')
        break
      case '400|username':
        errorMessage = t('signup.error.invalid_username')
        break
      case '409|username':
        errorMessage = t('signup.error.conflict_username')
        break
      case '400|captcha':
        errorMessage = t('signup.error.invalid_captcha')
        break
    }

    return (
      <Message negative>
        <Message.Header>{t('signup.error.title')}</Message.Header>
        <p>{errorMessage}</p>
      </Message>
    )
  }

  render () {
    const { open, user, toggleSignupModal, t } = this.props
    const { captcha, password, showPassword, username } = this.state
    if (user) {
      toggleSignupModal(false)
      return null
    }
    return (
      <Modal open={open} onClose={() => toggleSignupModal(false)}>
        <Modal.Header>
          {t('signup.title')}
        </Modal.Header>
        <Modal.Content>
          <Mutation
            mutation={this.query}
            variables={{ username, password, captcha }}
            onError={this.handleError}
            onCompleted={this.handleCompleted}>
            {(mutation, { loading, error }) => (
              <Form onSubmit={(e) => this.handleSubmit(e, mutation)}>
                {this.renderError(error)}
                <Form.Input
                  label={t('signup.username_label')} value={username} required disabled={loading}
                  onChange={(e) => this.setState({ username: e.target.value })} />
                <Form.Input
                  label={t('signup.password_label')} type={showPassword ? 'text' : 'password'}
                  value={password} required disabled={loading}
                  action={{ icon: showPassword ? 'eye slash' : 'eye', as: 'div', onClick: this.handleShowPassword }}
                  onChange={(e) => this.setState({ password: e.target.value })} />
                <ReCAPTCHA
                  ref={this.captcha}
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  size='invisible' badge='inline'
                  onChange={this.handleCaptchaChanged}
                />
                <Button type='submit' disabled={loading}>{t('signup.submit')}</Button>
              </Form>
            )}
          </Mutation>
        </Modal.Content>
      </Modal>
    )
  }
}

SignupModal.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.object,
  setAccessToken: PropTypes.func.isRequired,
  setRefreshToken: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
  toggleSignupModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    open: state.views.openSignupModal,
    user: state.main.user
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    actions
  )(SignupModal)
)
