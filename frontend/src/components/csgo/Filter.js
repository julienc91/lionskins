import React, { Component } from 'react'
import { Form, Select } from 'semantic-ui-react'
import { WeaponsByCategories, Rarities, Qualities, Weapons, Categories } from './enums'
import PropTypes from 'prop-types'

class Filter extends Component {
  handleFilterChanged (filters) {
    if (this.props.onChange) {
      this.props.onChange(filters)
    }
  }

  static getChoicesFromEnum (enum_) {
    let res = [{ key: 'all', text: 'All', value: 'all' }]
    Object.keys(enum_).map(e =>
      res.push({
        key: e,
        text: enum_[e],
        value: e
      })
    )
    return res
  }

  static getChoicesForWeapons () {
    let res = [{ key: 'all', text: 'All', value: 'all' }]
    Object.keys(WeaponsByCategories).map(category => {
      res.push({ key: `C${category}`, text: Categories[category], value: `C${category}` })
      WeaponsByCategories[category].map(weapon => {
        res.push({ key: `W${weapon}`, text: Weapons[weapon], value: `W${weapon}`, icon: 'caret right' })
        return null
      })
      return null
    })
    return res
  }

  static getChoicesForStatTrakSouvenir () {
    return [
      { key: 'all', text: 'All', value: 'all' },
      { key: 'statTrak', text: 'StatTrak', value: 'statTrak' },
      { key: 'souvenir', text: 'Souvenir', value: 'souvenir' },
      { key: 'none', text: 'None', value: 'none' }
    ]
  }

  render () {
    const { defaultValues } = this.props

    let defaultStatTrakValue = 'all'
    if (defaultValues.statTrak) {
      defaultStatTrakValue = 'statTrak'
    } else if (defaultValues.souvenir) {
      defaultStatTrakValue = 'souvenir'
    } else if (defaultValues.statTrak === false && defaultValues.souvenir === false) {
      defaultStatTrakValue = 'none'
    }

    let defaultWeaponValue = 'all'
    if (defaultValues.weapon) {
      defaultWeaponValue = `W${defaultValues.weapon}`
    } else if (defaultValues.category) {
      defaultWeaponValue = `C${defaultValues.category}`
    }

    return (
      <Form>
        <Form.Group>
          <Form.Field
            control={Select}
            label='Weapon'
            options={Filter.getChoicesForWeapons()}
            value={defaultWeaponValue}
            onChange={(e, { value }) => {
              if (value === 'all') {
                this.handleFilterChanged({ weapon: null, category: null })
              } else if (value[0] === 'W') {
                this.handleFilterChanged({ weapon: value.substring(1), category: null })
              } else if (value[0] === 'C') {
                this.handleFilterChanged({ weapon: null, category: value.substring(1) })
              }
            }}
            search
          />
          <Form.Field
            control={Select}
            label='Quality'
            options={Filter.getChoicesFromEnum(Qualities)}
            value={defaultValues.quality || 'all'}
            onChange={(e, { value }) => this.handleFilterChanged({ quality: (value !== 'all') ? value : null })}
          />
          <Form.Field
            control={Select}
            label='Rarity'
            options={Filter.getChoicesFromEnum(Rarities)}
            value={defaultValues.rarity || 'all'}
            onChange={(e, { value }) => this.handleFilterChanged({ rarity: (value !== 'all') ? value : null })}
          />
          <Form.Field
            control={Select}
            label='StatTrak/Souvenir'
            options={Filter.getChoicesForStatTrakSouvenir()}
            value={defaultStatTrakValue}
            onChange={(e, { value }) => {
              let statTrak, souvenir
              switch (value) {
                case 'none':
                  statTrak = false
                  souvenir = false
                  break
                case 'statTrak':
                  statTrak = true
                  souvenir = false
                  break
                case 'souvenir':
                  statTrak = false
                  souvenir = true
                  break
                default:
                  statTrak = null
                  souvenir = null
              }
              this.handleFilterChanged({ statTrak, souvenir })
            }}
          />
          <SearchInput
            defaultValue={defaultValues.search}
            onChange={(value) => this.handleFilterChanged({ search: value })}
          />
        </Form.Group>
      </Form>
    )
  }
}

Filter.propTypes = {
  defaultValues: PropTypes.object,
  onChange: PropTypes.func.isRequired
}

class SearchInput extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: props.defaultValue || ''
    }
    this.timer = null
    this.handleChange = this.handleChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  handleChange (e, res) {
    const { value } = res
    clearTimeout(this.timer)

    this.setState({ value })
    this.timer = setTimeout(this.triggerChange.bind(this), 500)
  }

  handleKeyDown (e) {
    if (e.keyCode === 13) {
      this.triggerChange()
    }
  }

  triggerChange () {
    const { value } = this.state
    this.props.onChange(value)
  }

  render () {
    return (
      <Form.Input
        label='Search'
        value={this.state.value}
        placeholder='Search'
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
      />
    )
  }
}

SearchInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.string
}

export default Filter
