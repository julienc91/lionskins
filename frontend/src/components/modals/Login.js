import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { Button, Form, Message, Modal } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Mutation } from 'react-apollo'
import * as actions from '../../actions'
import gql from 'graphql-tag'
import client from '../../apollo'

class LoginModal extends Component {
  query = gql`
  mutation($username: String!, $password: String!) {
    authenticate(username: $username, password: $password) {
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
      password: ''
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
    const { accessToken, refreshToken } = res.authenticate
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
    let errorMessage = t('login.error.default_error')
    const errorCode = error.graphQLErrors && error.graphQLErrors[0].code
    switch (errorCode + '|') {
      case '401|':
        errorMessage = t('login.error.invalid_credentials')
        break
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
      toggleLoginModal(false)
      return null
    }
    return (
      <Modal open={open} onClose={() => toggleLoginModal(false)}>
        <Modal.Header>
          {t('login.title')}
        </Modal.Header>
        <Modal.Content>
          <Mutation
            mutation={this.query}
            variables={{ username, password }}
            onError={this.handleError}
            onCompleted={this.handleCompleted}
          >
            {(mutation, { loading, error }) => (
              <Form onSubmit={(e) => this.handleSubmit(e, mutation)}>
                {this.renderError(error)}
                <Form.Input
                  label={t('login.username_label')} value={username} required disabled={loading}
                  onChange={(e) => this.setState({ username: e.target.value })} />
                <Form.Input
                  label={t('login.password_label')} type='password' value={password} required disabled={loading}
                  onChange={(e) => this.setState({ password: e.target.value })} />
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
