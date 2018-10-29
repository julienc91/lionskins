import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumb as SemanticUIBreadcrumb } from 'semantic-ui-react'
import PropTypes from 'prop-types'

class Breadcrumb extends Component {
  render () {
    const { items } = this.props
    return (
      <SemanticUIBreadcrumb>
        <SemanticUIBreadcrumb.Section><Link to='/'>Home</Link></SemanticUIBreadcrumb.Section>
        {items.map((item) => [
          <SemanticUIBreadcrumb.Divider key='divider' icon='right angle' />,
          <SemanticUIBreadcrumb.Section key={item.name}>
            {item.link ? <Link to={item.link}>{item.name}</Link> : item.name}
          </SemanticUIBreadcrumb.Section>
        ])
        }
      </SemanticUIBreadcrumb>
    )
  }
}

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      link: PropTypes.string
    })
  )
}

export default Breadcrumb
