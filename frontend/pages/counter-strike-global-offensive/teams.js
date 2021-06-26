import React from 'react'
import axios from 'axios'
import Head from 'next/head'
import { Trans, useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { Card, Container, Header } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import Breadcrumb from '../../components/Breadcrumb'
import Team from '../../components/csgo/Team'
import nextI18NextConfig from '../../next-i18next.config'

const TeamList = ({ teams }) => {
  const { t } = useTranslation('csgo')
  return (
    <Container className='page pro-players'>
      <Head>
        <title>{t('csgo.teams.page_title')}</title>
      </Head>

      <Breadcrumb
        items={[
          { name: 'Counter-Strike: Global Offensive', link: '/counter-strike-global-offensive/' },
          { name: t('csgo.teams.breadcrumb') }
        ]}
      />

      <Header as='h1' textAlign='center'>
        {t('csgo.teams.title')}
        <Header.Subheader>
          {t('csgo.teams.subtitle')}
        </Header.Subheader>
      </Header>

      <div className='team-list'>
        <Card.Group className='item-list'>
          {teams.map(team => <Team key={team.name} team={team} />)}
          <div className='padding-item' />
          <div className='padding-item' />
          <div className='padding-item' />
          <div className='padding-item' />
        </Card.Group>

        <div className='disclaimer'>
          <Trans i18nKey='csgo.teams.disclaimer' ns='csgo'>
            <a href='https://globalranks.gg/' target='_blank' rel='noopener noreferrer'>-</a>
            <a href='https://liquipedia.net/counterstrike/' target='_blank' rel='noopener noreferrer'>-</a>
          </Trans>
        </div>

      </div>
    </Container>
  )
}

TeamList.propTypes = {
  teams: PropTypes.array.isRequired
}

export const getServerSideProps = async ({ locale }) => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API_DOMAIN}/teams.json`)

  const teams = res.data
  return { props: { teams, ...(await serverSideTranslations(locale, ['common', 'csgo'], nextI18NextConfig)) } }
}

export default TeamList
