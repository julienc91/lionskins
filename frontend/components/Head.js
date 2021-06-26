import React from 'react'
import NextHead from 'next/head'
import { useRouter } from 'next/router'
import { withTranslation } from 'next-i18next'
import PropTypes from 'prop-types'

const Head = ({ t }) => {
  const router = useRouter()
  const locales = router.locales
  const path = router.asPath.split('?')[0].slice(4)
  return (
    <NextHead>
      {locales.filter(locale => locale !== 'catchAll').map(locale => (
        <link
          key={`alternate-${locale}`} rel='alternate' hrefLang={locale}
          href={`${process.env.NEXT_PUBLIC_FRONTEND_DOMAIN}/${locale}/${path}`}
        />
      ))}
      <meta key='description' name='description' content={t('head.description')} />
    </NextHead>
  )
}

Head.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation('common')(Head)
