import { SettingsManager } from '../components/SettingsProvider'

export const formatPrice = (price, locale) => {
  const currency = SettingsManager.getCurrency()
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price)
}
