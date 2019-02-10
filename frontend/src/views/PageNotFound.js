import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { Container, Header, Icon, Button } from 'semantic-ui-react'
import PropTypes from 'prop-types'

class PageNotFound extends Component {
  render () {
    const { t } = this.props
    return (
      <Container>
        <Header as='h1' icon className='no-results'>
          <Icon name='frown outline' />
          {t('not_found.title')}
          <Header.Subheader>{t('not_found.subtitle')}</Header.Subheader>
          <Header.Subheader>
            <Link to='/'>
              <Button primary>
                {t('not_found.homepage')}
              </Button>
            </Link>
          </Header.Subheader>
        </Header>
      </Container>
    )
  }
}

PageNotFound.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(PageNotFound)
