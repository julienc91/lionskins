import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import { Checkbox, Form, Select } from 'semantic-ui-react'
import SearchInput from '../forms/SearchInput'
import { WeaponsByCategories, Rarities, Qualities, Weapons, Categories } from './enums'
import PropTypes from 'prop-types'

class Filter extends React.Component {
  getChoicesFromEnum (enum_) {
    const { t } = this.props
    let res = [{ key: 'all', text: t('csgo.filters.all'), value: 'all' }]
    Object.keys(enum_).map(e =>
      res.push({
        key: e,
        text: t(enum_[e]),
        value: e
      })
    )
    return res
  }

  getChoicesForWeapons () {
    const { t } = this.props
    let res = [{ key: 'all', text: t('csgo.filters.all'), value: 'all' }]
    Object.keys(WeaponsByCategories).map(category => {
      res.push({ key: `C${category}`, text: t(Categories[category]), value: `C${category}` })
      WeaponsByCategories[category].map(weapon => {
        res.push({ key: `W${weapon}`, text: t(Weapons[weapon]), value: `W${weapon}`, icon: 'caret right' })
        return null
      })
      return null
    })
    return res
  }

  renderWeapon () {
    const { changeFilter, category, weapon, t } = this.props

    let defaultWeaponValue = 'all'
    if (weapon) {
      defaultWeaponValue = `W${weapon}`
    } else if (category) {
      defaultWeaponValue = `C${category}`
    }

    return (
      <Form.Field
        control={Select}
        label={t('csgo.filters.weapon_label')}
        options={this.getChoicesForWeapons()}
        value={defaultWeaponValue}
        onChange={(e, { value }) => {
          if (value === 'all') {
            changeFilter({ weapon: null, category: null })
          } else if (value[0] === 'W') {
            changeFilter({ weapon: value.substring(1), category: null })
          } else if (value[0] === 'C') {
            changeFilter({ weapon: null, category: value.substring(1) })
          }
        }}
        search
      />
    )
  }

  renderQuality () {
    const { changeFilter, quality, t } = this.props
    return (
      <Form.Field
        control={Select}
        label={t('csgo.filters.quality_label')}
        options={this.getChoicesFromEnum(Qualities)}
        value={quality || 'all'}
        onChange={(e, { value }) => changeFilter({ quality: (value !== 'all') ? value : null })}
      />
    )
  }

  renderRarity () {
    const { changeFilter, rarity, t } = this.props
    return (
      <Form.Field
        control={Select}
        label={t('csgo.filters.rarity_label')}
        options={this.getChoicesFromEnum(Rarities)}
        value={rarity || 'all'}
        onChange={(e, { value }) => changeFilter({ rarity: (value !== 'all') ? value : null })}
      />
    )
  }

  renderStatTrakSouvenir () {
    const { changeFilter, statTrak, souvenir, t } = this.props
    let defaultStatTrakValue = 'all'
    if (statTrak) {
      defaultStatTrakValue = 'statTrak'
    } else if (souvenir) {
      defaultStatTrakValue = 'souvenir'
    } else if (statTrak === false && souvenir === false) {
      defaultStatTrakValue = 'none'
    }

    return (
      <Form.Field
        control={Select}
        label={t('csgo.filters.stat_trak_souvenir_label')}
        options={[
          { key: 'all', text: t('csgo.filters.all'), value: 'all' },
          { key: 'statTrak', text: t('csgo.filters.stat_trak'), value: 'statTrak' },
          { key: 'souvenir', text: t('csgo.filters.souvenir'), value: 'souvenir' },
          { key: 'none', text: t('csgo.filters.none'), value: 'none' }
        ]}
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
          changeFilter({ statTrak, souvenir })
        }}
      />
    )
  }

  renderSearch () {
    const { changeFilter, search } = this.props
    return (
      <SearchInput
        defaultValue={search}
        onChange={(value) => changeFilter({ search: value })}
      />
    )
  }

  renderGroupSimilar () {
    const { changeFilter, group, t } = this.props
    return (
      <Form.Field>
        <Checkbox
          toggle
          checked={group}
          label={t('csgo.filters.group_similar_label')}
          onChange={(e, { checked }) => {
            changeFilter({ group: checked })
          }}
        />
      </Form.Field>
    )
  }

  render () {
    return (
      <Form>
        <Form.Group>
          {this.renderWeapon()}
          {this.renderQuality()}
          {this.renderRarity()}
          {this.renderStatTrakSouvenir()}
          {this.renderSearch()}
          {this.renderGroupSimilar()}
        </Form.Group>
      </Form>
    )
  }
}

Filter.propTypes = {
  statTrak: PropTypes.bool,
  souvenir: PropTypes.bool,
  search: PropTypes.string,
  rarity: PropTypes.string,
  quality: PropTypes.string,
  weapon: PropTypes.string,
  category: PropTypes.string,
  group: PropTypes.bool,
  changeFilter: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    statTrak: state.csgo.filters.statTrak,
    souvenir: state.csgo.filters.souvenir,
    search: state.csgo.filters.search,
    rarity: state.csgo.filters.rarity,
    quality: state.csgo.filters.quality,
    weapon: state.csgo.filters.weapon,
    category: state.csgo.filters.category,
    group: state.csgo.filters.group
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    actions
  )(Filter)
)
