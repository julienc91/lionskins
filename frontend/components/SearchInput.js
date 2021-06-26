import React, { useEffect, useState } from 'react'
import { withTranslation } from 'next-i18next'
import { Form } from 'semantic-ui-react'
import PropTypes from 'prop-types'

const SearchInput = ({ defaultValue, onChange, t }) => {
  const [currentValue, setCurrentValue] = useState(defaultValue)
  const [timer, setTimer] = useState(0)

  const handleChange = (_, { value }) => {
    setCurrentValue(value)
  }

  const handleKeyDown = ({ keyCode }) => {
    if (keyCode === 13) {
      triggerChange(true)
    }
  }

  const triggerChange = immediate => {
    clearTimeout(timer)
    if (immediate) {
      onChange(currentValue)
    } else {
      setTimer(setTimeout(() => triggerChange(true), 500))
    }
  }

  useEffect(() => triggerChange(false), [currentValue])

  return (
    <Form.Input
      label={t('csgo.filters.search_label')}
      value={currentValue}
      placeholder={t('csgo.filters.search_label')}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  )
}

SearchInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.string,
  t: PropTypes.func.isRequired
}

export default withTranslation('csgo')(SearchInput)
