import React from 'react'
import { Breadcrumb as SemanticUIBreadcrumb } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { Link, withTranslation } from '../i18n'

const Breadcrumb = ({ items, t }) => {
  return (
    <SemanticUIBreadcrumb>
      <SemanticUIBreadcrumb.Section><Link href='/'><a>{t('breadcrumb.home')}</a></Link></SemanticUIBreadcrumb.Section>
      {items.map((item) => [
        <SemanticUIBreadcrumb.Divider key='divider' icon='right angle' />,
        <SemanticUIBreadcrumb.Section key={item.name}>
          {item.link ? <Link href={item.link}><a>{item.name}</a></Link> : item.name}
        </SemanticUIBreadcrumb.Section>
      ])}
    </SemanticUIBreadcrumb>
  )
}

Breadcrumb.propTypes = {
  t: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      link: PropTypes.string
    })
  )
}

export default withTranslation('breadcrumb')(Breadcrumb)
