import React from 'react'
import { connect } from 'react-redux'
import gql from 'graphql-tag'
import client, { refreshClient } from '../apollo'
import * as actions from '../actions'
import PropTypes from 'prop-types'

class AuthenticationProcess extends React.Component {

  refreshTokenQuery = gql`
    mutation {
      refreshToken {
        accessToken
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
    this.refreshTokenInterval = null

    this.refreshToken = this.refreshToken.bind(this)
    this.getCurrentUser = this.getCurrentUser.bind(this)
  }

  componentDidMount () {
    this.refreshTokenInterval = setInterval(this.refreshToken, 5 * 60 * 1000)
    this.refreshToken()
  }

  componentWillUnmount () {
    clearInterval(this.refreshTokenInterval)
  }

  refreshToken () {
    const { refreshToken, setAccessToken } = this.props
    if (!refreshToken) {
      return
    }
    refreshClient.mutate({
      mutation: this.refreshTokenQuery
    }).then(response => {
      const { accessToken } = response.data.refreshToken
      setAccessToken(accessToken)
      this.getCurrentUser()
    })
  }

  getCurrentUser () {
    const { accessToken, setUser } = this.props
    if (!accessToken) {
      return
    }
    client.query({
      query: this.getUserQuery
    }).then(response => {
      const user = response.data.currentUser
      setUser(user)
    })
  }

  render () {
    return null
  }
}

AuthenticationProcess.propTypes = {
  accessToken: PropTypes.string,
  refreshToken: PropTypes.string,
  setAccessToken: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    user: state.main.user,
    accessToken: state.main.accessToken,
    refreshToken: state.main.refreshToken
  }
}

export default connect(
  mapStateToProps,
  actions
)(AuthenticationProcess)
