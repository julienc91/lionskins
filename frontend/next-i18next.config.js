const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'catchAll',
    locales: ['en', 'fr', 'catchAll']
  },
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
  },
  localePath: path.resolve('./public/locales'),
  react: {
    useSuspense: false
  },
  serializeConfig: false
}
