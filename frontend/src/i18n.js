import i18n from 'i18next'
import Backend from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
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

export default i18n
