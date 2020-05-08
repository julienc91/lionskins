import React from 'react'
import { connect } from 'react-redux'
import client, { refreshClient } from '../apollo'
import * as actions from '../actions'
import PropTypes from 'prop-types'
import { refreshTokenQuery } from '../api/authentication'
import { getUserQuery } from '../api/users'
import { getUserListsQuery } from '../api/lists'

class AuthenticationProcess extends React.Component {
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
    const { refreshToken, setAccessToken, setRefreshToken, setUser } = this.props
    if (!refreshToken) {
      return
    }
    refreshClient.mutate({
      mutation: refreshTokenQuery
    }).then(response => {
      response = response.data.refreshToken
      if (response.error.status === 401) {
        setAccessToken('')
        setRefreshToken('')
        setUser(null)
      } else if (response.error.status === 200) {
        const { accessToken } = refreshToken
        setAccessToken(accessToken)
        this.getCurrentUser()
        this.getCurrentUserLists()
      }
    })
  }

  getCurrentUser () {
    const { accessToken, setUser } = this.props
    if (!accessToken) {
      return
    }
    client.query({
      query: getUserQuery
    }).then(response => {
      const user = response.data.currentUser
      setUser(user)
    })
  }

  getCurrentUserLists () {
    const { accessToken, setUserLists } = this.props
    if (!accessToken) {
      return
    }
    client.query({
      query: getUserListsQuery
    }).then(response => {
      const data = response.data.currentUserLists.edges
      const lists = data.map(item => item.node)
      setUserLists(lists)
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
  setRefreshToken: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
  setUserLists: PropTypes.func.isRequired
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
