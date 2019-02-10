import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Trans, withTranslation } from 'react-i18next'
import { Container, Header } from 'semantic-ui-react'
import Breadcrumb from '../components/tools/Breadcrumb'
import PropTypes from 'prop-types'

class About extends Component {
  componentDidMount () {
    const { t } = this.props
    document.title = t('about.page_title')
  }

  render () {
    const { t } = this.props
    return (
      <Container className='page about'>
        <Breadcrumb items={[{ 'name': t('about.breadcrumb') }]} />

        <Header as='h1' textAlign='center'>
          {t('about.title')}
          <Header.Subheader>{t('about.subtitle')}</Header.Subheader>
        </Header>

        <Container>

          <Header as='h2'>{t('about.part1.title')}</Header>

          <p>{t('about.part1.content1')}</p>
          <p>{t('about.part1.content2')}</p>
          <p>{t('about.part1.content3')}</p>
          <p><Trans i18nKey='about.part1.content4'>-<Link to='/contact/'>-</Link></Trans></p>

        </Container>
      </Container>
    )
  }
}

About.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation()(About)
