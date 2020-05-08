import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { Button, Form, Message, Modal } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Mutation } from 'react-apollo'
import * as actions from '../../actions'
import client from '../../apollo'
import { authenticateQuery } from '../../api/authentication'
import { getUserQuery } from '../../api/users'

class LoginModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      password: '',
      error: null
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCompleted = this.handleCompleted.bind(this)
  }

  handleSubmit (e, mutation) {
    e.preventDefault()
    mutation()
  }

  handleCompleted (res) {
    const { setAccessToken, setRefreshToken, setUser } = this.props
    const { accessToken, error, refreshToken } = res.authenticate
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
    let errorMessage = t('login.error.default_error')
    if (error.status === 401) {
      errorMessage = t('login.error.invalid_credentials')
    }

    return (
      <Message negative>
        <Message.Header>{t('login.error.title')}</Message.Header>
        <p>{errorMessage}</p>
      </Message>
    )
  }

  render () {
    const { open, toggleLoginModal, user, t } = this.props
    const { password, username } = this.state
    if (user) {
      open && toggleLoginModal(false)
      return null
    }
    return (
      <Modal open={open} onClose={() => toggleLoginModal(false)}>
        <Modal.Header>
          {t('login.title')}
        </Modal.Header>
        <Modal.Content>
          <Mutation
            mutation={authenticateQuery}
            variables={{ username, password }}
            onError={this.handleError}
            onCompleted={this.handleCompleted}
          >
            {(mutation, { loading }) => (
              <Form onSubmit={(e) => this.handleSubmit(e, mutation)}>
                {this.renderError()}
                <Form.Input
                  label={t('login.username_label')} value={username} required disabled={loading}
                  onChange={(e) => this.setState({ username: e.target.value })}
                />
                <Form.Input
                  label={t('login.password_label')} type='password' value={password} required disabled={loading}
                  onChange={(e) => this.setState({ password: e.target.value })}
                />
                <Button type='submit' disabled={loading}>{t('login.submit')}</Button>
              </Form>
            )}
          </Mutation>
        </Modal.Content>
      </Modal>
    )
  }
}

LoginModal.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.object,
  setAccessToken: PropTypes.func.isRequired,
  setRefreshToken: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
  toggleLoginModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    open: state.views.openLoginModal,
    user: state.main.user
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    actions
  )(LoginModal)
)
