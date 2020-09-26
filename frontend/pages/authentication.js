import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Container, Loader } from 'semantic-ui-react'
import useAuth from '../components/AuthenticationProvider'
import { StorageManager } from '../utils'

const Authentication = () => {
  const { user, loading, login } = useAuth()
  const router = useRouter()
  const [called, setCalled] = useState(false)

  useEffect(() => {
    if (!called && !loading) {
      setCalled(true)
      if (!user) {
        login()
      }
    }
  }, [called, loading, user])

  useEffect(() => {
    if (called && !loading) {
      const redirect = StorageManager.get('openid.redirect', false)
      if (redirect) {
        StorageManager.remove('openid.redirect', false)
        router.push(redirect)
      } else {
        router.push('/')
      }
    }
  }, [called, loading])
  return (
    <Container>
      <Loader active inline='centered' key='loader' />
    </Container>
  )
}

export default Authentication
