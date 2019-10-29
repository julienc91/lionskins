import React from 'react'
import { withTranslation } from 'react-i18next'
import { Icon, Message } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { StorageManager } from '../tools'

class Changelog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: false
    }

    this.CHANGELOG = {
      '2019-10-21': 'changelog.2019_10_21_001',
      '2019-10-20': 'changelog.2019_10_20_001'
    }

    this.handleDismiss = this.handleDismiss.bind(this)
  }

  componentDidMount () {
    const lastDismissDate = StorageManager.get('changelog.dismiss_date')
    const mostRecentChangelog = Object.keys(this.CHANGELOG).sort().pop()
    if (!lastDismissDate || new Date(lastDismissDate) < new Date(mostRecentChangelog)) {
      this.setState({ visible: true })
    }
  }

  handleDismiss () {
    StorageManager.set('changelog.dismiss_date', (new Date()).toISOString())
    this.setState({ visible: false })
  }

  render () {
    const { visible } = this.state
    if (!visible) {
      return null
    }

    const { t } = this.props

    const maxDays = 30

    const now = new Date()
    const messages = Object.keys(this.CHANGELOG)
      .filter(key => (now - (new Date(key))) < (maxDays * 24 * 60 * 60 * 1000))

    if (!messages.length) {
      return null
    }

    return (
      <Message icon info onDismiss={this.handleDismiss}>
        <Icon name='bullhorn' />
        <Message.Content>
          <Message.Header>{t('changelog.title')}</Message.Header>
          <ul>
            {messages.map((date, i) => (
              <li key={i}>{t('date', { date })} - {t(this.CHANGELOG[date])}</li>
            ))}
          </ul>
        </Message.Content>
      </Message>
    )
  }
}

Changelog.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(Changelog)
