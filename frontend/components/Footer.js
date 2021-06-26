import React from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'

const Footer = () => {
  const { t } = useTranslation('common')
  return (
    <footer key='footer'>
      <ul>
        <li>
          <Link href='/about/'><a>{t('footer.about')}</a></Link>
        </li>
        <li>
          <Link href='/contact/'><a>{t('footer.contact')}</a></Link>
        </li>
        <li>
          <Link href='/faq/'><a>{t('footer.faq')}</a></Link>
        </li>
        <li>
          <Link href='/privacy-policy/'><a>{t('footer.privacy_policy')}</a></Link>
        </li>
      </ul>
      <div>© {getCopyright()} - LionSkins</div>
    </footer>
  )
}

export default Footer

const getCopyright = () => {
  const startYear = 2018
  const currentYear = (new Date()).getFullYear()
  if (currentYear > startYear) {
    return `${startYear}-${currentYear}`
  }
  return startYear
}
