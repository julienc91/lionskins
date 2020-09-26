import React, { createContext, useContext, useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import axios from 'axios'
import PropTypes from 'prop-types'
import { client, refreshClient } from '../apollo'
import AuthenticationManager from '../utils/authentication'

const refreshTokenQuery = gql`
  mutation {
    refreshToken {
      accessToken,
      error {
        status
      }
    }
  }`

export const getUserQuery = gql`
  query {
    currentUser {
      id,
      username,
      steamId
    }
  }`

const AuthContext = createContext({})

export const AuthenticationProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const getUser = async () => {
    const token = AuthenticationManager.getToken()
    if (token) {
      const res = await client.query({ query: getUserQuery })
      const user = res.data.currentUser
      if (user) {
        setUser(user)
      }
    }
  }

  const refreshToken = async () => {
    const token = AuthenticationManager.getRefreshToken()
    if (!token) {
      return
    }

    const response = await refreshClient.mutate({ mutation: refreshTokenQuery })
    if (response.data.refreshToken.error.status === 401) {
      AuthenticationManager.setToken(null)
      AuthenticationManager.setRefreshToken(null)
    } else if (response.data.refreshToken.error.status === 200) {
      AuthenticationManager.setToken(response.data.refreshToken.accessToken)
    }

    setTimeout(refreshToken, 5 * 60 * 1000)
  }

  const login = async () => {
    setLoading(true)
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_DOMAIN}/rest/jwt/`, null, { withCredentials: true })
    if (res.status === 200) {
      const { accessToken, refreshToken } = res.data
      AuthenticationManager.setToken(accessToken)
      AuthenticationManager.setRefreshToken(refreshToken)
      await getUser()
      setLoading(false)
    }
  }

  const logout = () => {
    axios.delete(`${process.env.NEXT_PUBLIC_API_DOMAIN}/rest/jwt/`, { withCredentials: true })
    AuthenticationManager.setRefreshToken(null)
    AuthenticationManager.setToken(null)
    setUser(null)
  }

  useEffect(() => {
    (async () => {
      const token = AuthenticationManager.getRefreshToken()
      if (token) {
        await refreshToken()
        await getUser()
      }
      setLoading(false)
    })()
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

AuthenticationProvider.propTypes = {
  children: PropTypes.node
}

export default function useAuth () {
  return useContext(AuthContext)
}
