import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Container, Loader } from 'semantic-ui-react'
import useAuth from '../components/AuthenticationProvider'
import { StorageManager } from '../utils'
import nextI18NextConfig from '../next-i18next.config'

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

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'], nextI18NextConfig))
  }
})

export default Authentication
