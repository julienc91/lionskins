import React from 'react'
import { connect } from 'react-redux'
import { Line } from 'react-chartjs-2'
import { Form, Header, Radio, Select } from 'semantic-ui-react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import * as actions from '../../actions'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { Providers } from '../enums'
import { Qualities } from './enums'

const MODE_AVERAGE = 'average'
const MODE_MIN = 'min'

class SkinPricesHistory extends React.Component {
  query = gql`
    query ($skin: String, $currency: TypeCurrency) {
      history (skin: $skin) {
        edges {
          node {
            provider,
            price (currency: $currency),
            creationDate
          }
        }
      }
    }
  `

  constructor (props) {
    super(props)
    this.state = {
      history: [],
      filter: 'all',
      grouped: false,
      mode: MODE_MIN
    }

    this.handleChangeMode = this.handleChangeMode.bind(this)
    this.handleChangeGrouped = this.handleChangeGrouped.bind(this)
    this.handleChangeFilter = this.handleChangeFilter.bind(this)
  }

  componentDidMount () {
    this.executeQuery()
  }

  executeQuery () {
    const { currency, skins } = this.props
    skins.forEach(async skin => {
      let result = await this.props.client.query({
        query: this.query,
        variables: {
          currency,
          skin: skin.id
        }
      })
      result = result.data.history.edges.map(e => e.node)
      result.forEach(h => {
        h.skinId = skin.id
      })

      this.setState(prevState => {
        return {
          ...prevState,
          history: [...prevState.history, ...result]
        }
      })
    })
  }

  handleChangeMode (e, { value }) {
    this.setState({ mode: value })
  }

  handleChangeGrouped (e, { checked }) {
    this.setState({ grouped: checked })
  }

  handleChangeFilter (e, { value }) {
    this.setState({ filter: value })
  }

  createDatasets () {
    const { filter, grouped, history, mode } = this.state
    const { skins } = this.props

    const groupedHistory = {}

    history.forEach(h => {
      const skin = skins.find(s => s.id === h.skinId)
      if ((filter.startsWith('vanilla') && (skin.souvenir || skin.statTrak)) ||
          (filter.startsWith('souvenir') && !skin.souvenir) ||
          (filter.startsWith('stat_trak') && !skin.statTrak)) {
        return
      }
      const filterQuality = filter.split('-', 2)[1]
      if (filter !== 'all' && filterQuality && skin.quality !== filterQuality) {
        return
      }

      const date = new Date(h.creationDate)
      const groupKey = date.toISOString().split('T')[0]
      if (!groupedHistory[groupKey]) {
        groupedHistory[groupKey] = []
      }
      groupedHistory[groupKey].push(h)
    })

    const datasets = {}
    if (grouped) {
      datasets[mode] = {
        label: '',
        backgroundColor: 'rgba(82, 123, 155, 0.5)',
        borderColor: '#527B9B',
        data: []
      }
    } else {
      const colors = {
        steam: '#010204',
        bitskins: '#9F3A38',
        csgoshop: '#A3C293',
        lootbear: '#9FB1BF',
        skinbaron: '#F1BD00'
      }
      Object.keys(Providers).forEach(p => {
        datasets[p] = {
          label: Providers[p],
          borderColor: colors[p],
          backgroundColor: colors[p],
          fill: false,
          data: []
        }
      })
    }

    const dates = Object.keys(groupedHistory)
    dates.sort()

    dates.forEach(key => {
      const groupHistory = groupedHistory[key]
      const x = new Date(key)
      let y
      if (grouped) {
        if (mode === MODE_AVERAGE) {
          y = groupHistory.reduce((m, current) => m + current.price, 0) / groupHistory.length
        } else {
          y = groupHistory.reduce((m, current) => m > 0 ? Math.min(m, current.price) : current.price, 0)
        }
        if (y > 0) {
          datasets[mode].data.push({ x, y })
        }
      } else {
        Object.keys(Providers).forEach(p => {
          const filteredGroupHistory = groupHistory.filter(h => h.provider === p)
          if (mode === MODE_AVERAGE) {
            y = filteredGroupHistory.reduce((m, current) => m + current.price, 0) / filteredGroupHistory.length
          } else {
            y = filteredGroupHistory.reduce((m, current) => m > 0 ? Math.min(m, current.price) : current.price, 0)
          }
          if (y > 0) {
            datasets[p].data.push({ x, y })
          }
        })
      }
    })
    return Object.values(datasets)
  }

  render () {
    const { currency, skins, t } = this.props
    const { filter, grouped, mode } = this.state

    const datasets = this.createDatasets()

    const skinFilters = [
      { key: 'all', text: t('csgo.filters.all'), value: 'all' }
    ]
    const flavors = ['vanilla']
    if (skins.some(s => s.souvenir)) {
      flavors.push('souvenir')
    }
    if (skins.some(s => s.statTrak)) {
      flavors.push('stat_trak')
    }

    flavors.forEach(flavor => {
      skinFilters.push({ key: flavor, text: t(`csgo.skin.${flavor}`), value: flavor })
      Object.keys(Qualities).forEach(quality => {
        skinFilters.push({
          key: `${flavor}-${quality}`,
          text: (flavor !== 'vanilla' ? (t(`csgo.skin.${flavor}`) + ' - ') : '') + t(`csgo.qualities.${quality}`),
          value: `${flavor}-${quality}`,
          icon: 'caret right'
        })
      })
    })

    return (
      <div className='prices-history'>
        <Line
          data={{
            datasets: datasets
          }}
          options={{
            legend: {
              display: !grouped
            },
            scales: {
              xAxes: [{
                type: 'time',
                time: {
                  displayFormats: {
                    day: 'L'
                  },
                  tooltipFormat: 'll',
                  unit: 'day'
                }
              }],
              yAxes: [{
                ticks: {
                  min: 0,
                  callback: value => t(`currency.${currency}`, { price: value })
                }
              }]
            },
            tooltips: {
              displayColors: !grouped,
              callbacks: {
                label: tooltipItem => t(`currency.${currency}`, { price: tooltipItem.value })
              }
            }
          }}
        />
        <Header as='h4'>{t('skin.prices_history.options')}</Header>
        <Form className='options'>
          <Form.Group>
            <Form.Field>
              {t('skin.prices_history.mode')}
            </Form.Field>
            <Form.Field>
              <Radio label={t('skin.prices_history.mode_min')} name='mode' value={MODE_MIN} checked={mode === MODE_MIN} onChange={this.handleChangeMode} />
            </Form.Field>
            <Form.Field>
              <Radio label={t('skin.prices_history.mode_average')} name='mode' value={MODE_AVERAGE} checked={mode === MODE_AVERAGE} onChange={this.handleChangeMode} />
            </Form.Field>
          </Form.Group>
          <Form.Group className='skins'>
            <Form.Field>
              {t('skin.prices_history.skins')}
            </Form.Field>
            <Form.Field
              control={Select}
              options={skinFilters}
              value={filter}
              onChange={this.handleChangeFilter}
            />
          </Form.Group>
          <Form.Group>
            <Form.Field>
              {t('skin.prices_history.group')}
            </Form.Field>
            <Form.Field>
              <Radio toggle name='grouped' checked={grouped} onChange={this.handleChangeGrouped} />
            </Form.Field>
          </Form.Group>
        </Form>
      </div>
    )
  }
}

SkinPricesHistory.propTypes = {
  t: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
  currency: PropTypes.string.isRequired,
  skins: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      quality: PropTypes.string.isRequired,
      statTrak: PropTypes.bool.isRequired,
      souvenir: PropTypes.bool.isRequired
    })
  ).isRequired
}

const mapStateToProps = state => {
  return {
    currency: state.main.currency
  }
}

export default withApollo(
  withTranslation()(
    connect(
      mapStateToProps,
      actions
    )(SkinPricesHistory)
  )
)
