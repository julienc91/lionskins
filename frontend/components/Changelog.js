import React, { useState } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { Icon, Message } from 'semantic-ui-react'
import { StorageManager } from '../utils'

const CHANGELOG = {
  '2019-11-19': 'changelog.2019_11_19_001',
  '2019-10-21': 'changelog.2019_10_21_001',
  '2019-10-20': 'changelog.2019_10_20_001',
  '2020-05-08': 'changelog.2020_05_08_001',
  '2020-05-09': 'changelog.2020_05_09_001',
  '2020-08-22': 'changelog.2020_05_22_001',
  '2021-02-12': 'changelog.2021_02_12_001',
  '2021-03-27': 'changelog.2021_03_27_001',
  '2021-10-01': 'changelog.2021_10_01_001'
}

const Changelog = () => {
  const { t } = useTranslation('common')
  let defaultLastDismissDate = StorageManager.get('changelog.dismiss_date')
  if (defaultLastDismissDate) {
    defaultLastDismissDate = new Date(defaultLastDismissDate)
  }

  const [lastDismissDate, setLastDismissDate] = useState(defaultLastDismissDate)

  const handleDismiss = () => {
    const newLastDismissDate = new Date()
    StorageManager.set('changelog.dismiss_date', newLastDismissDate.toISOString())
    setLastDismissDate(newLastDismissDate)
  }

  const maxDays = 30
  const now = new Date()

  const messages = Object.keys(CHANGELOG)
    // not older than 30 days
    .filter(key => (now - (new Date(key))) < (maxDays * 24 * 60 * 60 * 1000))
    // more recent than the last dismiss date
    .filter(key => !lastDismissDate || (new Date(key) > lastDismissDate))

  if (!messages.length) {
    return null
  }

  return (
    <Message icon info onDismiss={handleDismiss}>
      <Icon name='bullhorn' />
      <Message.Content>
        <Message.Header>{t('changelog.title')}</Message.Header>
        <ul>
          {messages.map((date, i) => (
            <li key={i}>{new Date(date).toLocaleDateString()} - {t(CHANGELOG[date])}</li>
          ))}
        </ul>
      </Message.Content>
    </Message>
  )
}

export default Changelog
