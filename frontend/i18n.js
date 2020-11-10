import getConfig from 'next/config'
import NextI18Next from 'next-i18next'
const path = require('path')

const { localeSubpaths } = getConfig().publicRuntimeConfig

const i18n = new NextI18Next({
  defaultLanguage: 'en',
  otherLanguages: ['fr'],
  localeSubpaths,
  localePath: path.resolve('./public/locales'),
  interpolation: {
    escapeValue: false,
    format: (value, format, lng) => {
      if (format === 'usd') {
        return new Intl.NumberFormat(lng, { style: 'currency', currency: 'USD' }).format(value)
      } else if (format === 'eur') {
        return new Intl.NumberFormat(lng, { style: 'currency', currency: 'EUR' }).format(value)
      } else if (format === 'date') {
        return new Intl.DateTimeFormat(lng).format(new Date(value))
      }
      return value
    }
  }
})

export const { appWithTranslation, Link, Trans, useTranslation, withTranslation } = i18n

export default i18n
