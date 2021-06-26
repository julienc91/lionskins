import React, { useEffect, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import ReCAPTCHA from 'react-google-recaptcha'
import { Button, Container, Form, Header, Message } from 'semantic-ui-react'
import Breadcrumb from '../components/Breadcrumb'
import nextI18NextConfig from '../next-i18next.config'

const sendMessageQuery = gql`
  mutation contact($name: String, $email: String, $message: String!, $captcha: String!) {
    contact(name: $name, email: $email, message: $message, captcha: $captcha) {
      id
    }
  }`

const Contact = () => {
  const { t } = useTranslation('contact')
  const [sent, setSent] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [captcha, setCaptcha] = useState(null)
  const [readyToSend, setReadyToSend] = useState(false)
  const [sendMessage, { loading, error }] = useMutation(sendMessageQuery, {
    onCompleted: () => {
      setSent(true)
    }
  })

  const captchaRef = React.createRef()

  const handleSubmit = e => {
    e.preventDefault()
    if (captcha) {
      handleSendMessage()
    } else {
      setReadyToSend(true)
      captchaRef.current.execute()
    }
  }

  const handleSendMessage = () => {
    sendMessage({ variables: { name, email, message, captcha } })
  }

  const handleCaptchaChanged = value => {
    setCaptcha(value)
  }

  useEffect(() => {
    if (captcha && readyToSend) {
      setReadyToSend(false)
      handleSendMessage()
    }
  }, [captcha, readyToSend])

  let inner

  if (!sent) {
    inner = (
      <Form onSubmit={handleSubmit}>
        {error && (
          <Message negative>
            <Message.Header>{t('contact.error.title')}</Message.Header>
            <p>{t('contact.error.content')}</p>
          </Message>
        )}
        <Form.Input
          label={t('contact.name_label')} value={name}
          onChange={e => setName(e.target.value)}
        />
        <Form.Input
          label={t('contact.email_label')} type='email' value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Form.TextArea
          label={t('contact.message_label')} minLength={50} maxLength={10000} required value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <ReCAPTCHA
          ref={captchaRef}
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          size='invisible' badge='inline'
          onChange={handleCaptchaChanged}
        />
        <Button type='submit' disabled={loading}>{t('contact.submit')}</Button>
      </Form>
    )
  } else {
    inner = (
      <Message positive>
        <Message.Header>{t('contact.success.title')}</Message.Header>
        <p>{t('contact.success.content')}</p>
      </Message>
    )
  }

  return (
    <Container className='page contact-form'>
      <Head>
        <title>{t('contact.page_title')}</title>
      </Head>

      <Breadcrumb items={[{ name: t('contact.breadcrumb') }]} />
      <Header as='h1' textAlign='center'>
        {t('contact.title')}
        <Header.Subheader>{t('contact.subtitle1')}<br />{t('contact.subtitle2')}</Header.Subheader>
      </Header>

      <Container>
        {inner}
      </Container>
    </Container>
  )
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'contact'], nextI18NextConfig))
  }
})

export default Contact
