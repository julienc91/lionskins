import React from 'react'
import useTranslation from 'next-translate/useTranslation'
import PropTypes from 'prop-types'
import { Checkbox, Form, Select } from 'semantic-ui-react'
import SearchInput from '../SearchInput'
import { WeaponsByCategories, Rarities, Qualities, Weapons, WeaponCategories } from '../../utils/csgo/enums'

const Filter = ({ filters, onFilterChanged }) => {
  const { t } = useTranslation('csgo')
  const { category, group, quality, rarity, search, souvenir, statTrak, type, weapon } = filters

  const getChoicesFromEnum = enum_ => {
    const res = [{ key: 'all', text: t('csgo.filters.all'), value: 'all' }]
    Object.keys(enum_).map(e =>
      res.push({
        key: e,
        text: t(enum_[e]),
        value: e
      })
    )
    return res
  }

  const getChoicesForWeapons = () => {
    const res = [{ key: 'all', text: t('csgo.filters.all'), value: 'all' }]
    Object.keys(WeaponsByCategories).map(category => {
      res.push({ key: `C${category}`, text: t(WeaponCategories[category]), value: `C${category}` })
      WeaponsByCategories[category].map(weapon => {
        res.push({ key: `W${weapon}`, text: t(Weapons[weapon]), value: `W${weapon}`, icon: 'caret right' })
        return null
      })
      return null
    })
    res.push({ key: 'Tagents', text: t('csgo.types.agents'), value: 'Tagents' })
    res.push({ key: 'Tmusic_kits', text: t('csgo.types.music_kits'), value: 'Tmusic_kits' })
    res.push({ key: 'Tgraffitis', text: t('csgo.types.graffitis'), value: 'Tgraffitis' })
    return res
  }

  let defaultWeaponValue = 'all'
  if (weapon) {
    defaultWeaponValue = `W${weapon}`
  } else if (category) {
    defaultWeaponValue = `C${category}`
  } else if (type) {
    defaultWeaponValue = `T${type}`
  }

  let defaultStatTrakValue = 'all'
  if (statTrak) {
    defaultStatTrakValue = 'statTrak'
  } else if (souvenir) {
    defaultStatTrakValue = 'souvenir'
  } else if (statTrak === false && souvenir === false) {
    defaultStatTrakValue = 'none'
  }

  return (
    <Form>
      <Form.Group>
        <Form.Field
          control={Select}
          label={t('csgo.filters.weapon_label')}
          options={getChoicesForWeapons()}
          value={defaultWeaponValue}
          onChange={(e, { value }) => {
            if (value === 'all') {
              onFilterChanged({ weapon: null, category: null, type: null })
            } else if (value[0] === 'W') {
              onFilterChanged({ weapon: value.substring(1), category: null, type: null })
            } else if (value[0] === 'C') {
              onFilterChanged({ weapon: null, category: value.substring(1), type: null })
            } else if (value[0] === 'T') {
              onFilterChanged({ weapon: null, category: null, type: value.substring(1) })
            }
          }}
          search
        />
        <Form.Field
          control={Select}
          label={t('csgo.filters.quality_label')}
          options={getChoicesFromEnum(Qualities)}
          value={quality || 'all'}
          onChange={(e, { value }) => onFilterChanged({ quality: (value !== 'all') ? value : null })}
        />
        <Form.Field
          control={Select}
          label={t('csgo.filters.rarity_label')}
          options={getChoicesFromEnum(Rarities)}
          value={rarity || 'all'}
          onChange={(e, { value }) => onFilterChanged({ rarity: (value !== 'all') ? value : null })}
        />
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
          onChange={(e, { value }) => (
            onFilterChanged({
              statTrak: value === 'statTrak' ? true : ((value === 'none' || value === 'souvenir') ? false : null),
              souvenir: value === 'souvenir' ? true : ((value === 'none' || value === 'statTrak') ? false : null)
            })
          )}
        />
        <SearchInput
          defaultValue={search}
          onChange={value => onFilterChanged({ search: value })}
        />
        <Form.Field>
          <Checkbox
            toggle
            checked={group}
            label={t('csgo.filters.group_similar_label')}
            onChange={(e, { checked }) => onFilterChanged({ group: checked })}
          />
        </Form.Field>
      </Form.Group>
    </Form>
  )
}

Filter.propTypes = {
  filters: PropTypes.shape({
    statTrak: PropTypes.bool,
    souvenir: PropTypes.bool,
    search: PropTypes.string,
    rarity: PropTypes.string,
    quality: PropTypes.string,
    weapon: PropTypes.string,
    category: PropTypes.string,
    type: PropTypes.string,
    group: PropTypes.bool
  }),
  onFilterChanged: PropTypes.func.isRequired
}

export default Filter
