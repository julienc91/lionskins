import React from 'react'
import { withTranslation } from 'react-i18next'
import { Form } from 'semantic-ui-react'
import PropTypes from 'prop-types'

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
    const { t } = this.props
    return (
      <Form.Input
        label={t('csgo.filters.search_label')}
        value={this.state.value}
        placeholder={t('csgo.filters.search_label')}
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
      />
    )
  }
}

SearchInput.propTypes = {
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.string
}

export default withTranslation()(SearchInput)
