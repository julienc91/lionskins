import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { Button, Form, Message, Modal } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Mutation } from 'react-apollo'
import * as actions from '../../actions'
import client from '../../apollo'
import ReCAPTCHA from 'react-google-recaptcha'
import { signupQuery } from '../../api/authentication'
import { getUserQuery } from '../../api/users'

class SignupModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      showPassword: false,
      captcha: null,
      error: null
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
    const { accessToken, error, refreshToken } = res.createUser
    if (error.status === 200) {
      this.setState({ error: null })
      setRefreshToken(refreshToken)
      setAccessToken(accessToken)
      client.query({
        query: getUserQuery
      }).then(response => {
        const user = response.data.currentUser
        setUser(user)
      })
    } else {
      this.setState({ error })
    }
  }

  renderError () {
    const { t } = this.props
    const { error } = this.state
    if (!error || error.status === 200) {
      return null
    }
    let errorMessage = t('signup.error.default_error')
    const errorCode = error.status
    const errorField = error.field

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
      default:
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
      open && toggleSignupModal(false)
      return null
    }
    return (
      <Modal open={open} onClose={() => toggleSignupModal(false)}>
        <Modal.Header>
          {t('signup.title')}
        </Modal.Header>
        <Modal.Content>
          <Mutation
            mutation={signupQuery}
            variables={{ username, password, captcha }}
            onError={this.handleError}
            onCompleted={this.handleCompleted}
          >
            {(mutation, { loading }) => (
              <Form onSubmit={(e) => this.handleSubmit(e, mutation)}>
                {this.renderError()}
                <Form.Input
                  label={t('signup.username_label')} value={username} required disabled={loading}
                  onChange={(e) => this.setState({ username: e.target.value })}
                />
                <Form.Input
                  label={t('signup.password_label')} type={showPassword ? 'text' : 'password'}
                  value={password} required disabled={loading}
                  action={{ icon: showPassword ? 'eye slash' : 'eye', as: 'div', onClick: this.handleShowPassword }}
                  onChange={(e) => this.setState({ password: e.target.value })}
                />
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
