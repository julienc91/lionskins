import React, { useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import InfiniteScroll from 'react-infinite-scroller'
import { Button, Card, Header, Icon, Loader, Sidebar } from 'semantic-ui-react'
import { Link, withTranslation } from '../../i18n'
import Breadcrumb from '../../components/Breadcrumb'
import Changelog from '../../components/Changelog'
import useSettings from '../../components/SettingsProvider'
import Filter from '../../components/csgo/Filter'
import Skin from '../../components/csgo/Skin'

export const getSkinsQuery = gql`
  query ($first: Int, $after: String, $weapon: CSGOWeapons, $category: CSGOCategories,
         $quality: CSGOQualities, $rarity: CSGORarities, $statTrak: Boolean, $souvenir: Boolean,
         $search: String, $currency: TypeCurrency, $slug: String) {
    csgo (first: $first, after: $after, weapon: $weapon, category: $category,
          quality: $quality, rarity: $rarity, statTrak: $statTrak, souvenir: $souvenir,
          search: $search, slug: $slug) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          name
          slug
          imageUrl
          statTrak
          quality
          rarity
          souvenir
          weapon {
            name
            category
          }
          prices {
            price (currency: $currency)
            provider
          }
        }
      }
    }
  }`

const defaultFilters = {
  category: null, rarity: null, quality: null, search: '', souvenir: null, statTrak: null, weapon: null
}

const getInitialFilters = query => {
  const res = { ...defaultFilters }

  Object.keys(query).forEach(filter => {
    let value = query[filter]
    if (defaultFilters[filter] !== undefined) {
      if (filter === 'search') {
        value = decodeURIComponent(value)
      } else if (value === 'true') {
        value = true
      } else if (value === 'false') {
        value = false
      }
      res[filter] = value
    }
  })
  return res
}

const CsgoSkinList = ({ t }) => {
  const router = useRouter()
  const { currency } = useSettings()
  const [showSidebar, setShowSidebar] = useState(false)
  const [variables, setVariables] = useState({ ...getInitialFilters(router.query), group: true, first: 80, currency })
  const [hasMore, setHasMore] = useState(true)
  const { data, fetchMore, loading } = useQuery(getSkinsQuery, { variables, notifyOnNetworkStatusChange: true })

  useEffect(() => data && setHasMore(data.csgo.pageInfo.hasNextPage), [data])
  useEffect(() => updateUrl(), [variables])
  useEffect(() => {
    setVariables({ ...variables, currency })
  }, [currency])

  const toggleSidebar = () => setShowSidebar(!showSidebar)

  const getMoreSkins = () => {
    fetchMore({
      variables: {
        ...variables,
        after: data.csgo.pageInfo.endCursor
      }
    })
  }

  const handleFilterChanged = value => {
    setVariables({ ...variables, ...value })
  }

  const updateUrl = () => {
    const params = []
    Object.keys(variables).forEach(filter => {
      if (defaultFilters[filter] !== undefined && variables[filter] !== undefined && defaultFilters[filter] !== variables[filter]) {
        let value = variables[filter]
        if (filter === 'search') {
          value = encodeURIComponent(value)
        }
        params.push(`${filter}=${value}`)
      }
    })
    if (window.location.search || params.length) {
      window.history.pushState({}, document.title, `${window.location.pathname}?${params.join('&')}`)
    } else {
      window.history.pushState({}, document.title, window.location.pathname)
    }
  }

  const renderSkins = () => {
    const skinList = []
    if (!variables.group) {
      skinList.push(...data.csgo.edges.map(({ node }) => node))
    } else {
      data.csgo.edges.forEach(({ node }) => {
        const lastGroupedSkin = (!skinList.length) ? null : skinList[skinList.length - 1]
        if (lastGroupedSkin && lastGroupedSkin.slug === node.slug && lastGroupedSkin.weapon.name === node.weapon.name) {
          lastGroupedSkin.souvenir = lastGroupedSkin.souvenir || node.souvenir
          lastGroupedSkin.statTrak = lastGroupedSkin.statTrak || node.statTrak
          lastGroupedSkin.rarity = lastGroupedSkin.rarity || node.rarity
          lastGroupedSkin.imageUrl = node.imageUrl || lastGroupedSkin.imageUrl

          const prices = {}
          lastGroupedSkin.prices.forEach(price => {
            prices[price.provider] = price
          })
          node.prices.forEach(price => {
            if (!prices[price.provider] || prices[price.provider].price > price.price) {
              prices[price.provider] = price
            }
          })
          lastGroupedSkin.prices = Object.values(prices)
        } else {
          node = { ...node }
          node.quality = ''
          skinList.push(node)
        }
      })
      if (data.csgo.pageInfo.hasNextPage) {
        skinList.pop()
      }
    }
    return skinList.map(skin => <Skin key={skin.id} skin={skin} />)
  }

  return (
    <div className='skin-list-container'>
      <Head>
        <title>{t('csgo:csgo.skin_list.page_title')}</title>
      </Head>

      <Sidebar
        className={'skin-list-filter-container' + (showSidebar ? ' active' : '')}
        visible
      >
        <Icon name='angle double right' className='expand-icon' onClick={toggleSidebar} />
        <Filter
          filters={variables}
          onFilterChanged={handleFilterChanged}
        />
      </Sidebar>

      <div className='skin-list' onClick={() => setShowSidebar(false)}>
        <Breadcrumb items={[{ name: 'Counter-Strike: Global Offensive' }]} />

        <div className='inventory-link'>
          <Link href='/counter-strike-global-offensive/my-inventory'>
            <Button primary icon labelPosition='left'>
              <Icon name='steam' />
              {t('csgo:csgo.skin_list.inventory_link')}
            </Button>
          </Link>
        </div>

        <Changelog />

        {!loading && data && !data.csgo.edges.length && (
          <Header as='h2' icon className='no-results'>
            <Icon name='frown outline' />
            {t('skin_list.no_results.title')}
            <Header.Subheader>{t('skin_list.no_results.subtitle')}</Header.Subheader>
          </Header>
        )}

        {data && !!data.csgo.edges.length && (
          <InfiniteScroll
            initialLoad={false}
            hasMore={hasMore}
            loadMore={getMoreSkins}
          >
            <Card.Group className='item-list'>
              {renderSkins()}
              <div className='padding-item' />
              <div className='padding-item' />
              <div className='padding-item' />
              <div className='padding-item' />
              <div className='padding-item' />
            </Card.Group>
          </InfiniteScroll>
        )}

        {loading && <Loader active inline='centered' key='loader' />}

      </div>
    </div>
  )
}

CsgoSkinList.propTypes = {
  t: PropTypes.func.isRequired
}

export default withTranslation(['skin_list', 'csgo'])(CsgoSkinList)
