import React from 'react'
import { Container, Header, Icon, Button } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { Link, withTranslation } from '../i18n'

const Page404 = ({ t }) => (
  <Container>
    <Header as='h1' icon className='no-results'>
      <Icon name='frown outline' />
      {t('404.title')}
      <Header.Subheader>{t('404.subtitle')}</Header.Subheader>
      <Header.Subheader>
        <Link href='/'>
          <Button primary>
            {t('404.homepage')}
          </Button>
        </Link>
      </Header.Subheader>
    </Header>
  </Container>
)

Page404.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation('404')(Page404)
