import React from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import BaseSkinList from '../SkinList'
import Skin from './Skin'
import Filter from './Filter'

class SkinList extends BaseSkinList {
  rootName = 'csgo'
  query = gql`
    query ($first: Int, $after: String, $weapon: CSGOWeapons, $category: CSGOCategories,
           $quality: CSGOQualities, $rarity: CSGORarities, $statTrak: Boolean, $souvenir: Boolean,
           $search: String) {
      csgo (first: $first, after: $after, weapon: $weapon, category: $category,
            quality: $quality, rarity: $rarity, statTrak: $statTrak, souvenir: $souvenir,
            search: $search) {
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
              price
              currency
              provider
            }
          }
        }
      }
    }`

  constructor (props) {
    super(props)
    this.handleFilterChanged = this.handleFilterChanged.bind(this)
    this.state.breadcrumb = [
      { name: 'Counter-Strike: Global Offensive' }
    ]
  }

  componentDidMount () {
    super.componentDidMount()
    document.title = 'Lion Skins - Counter-Strike: Global Offensive Skins'
  }

  getDefaultQueryParameters () {
    let queryParameters = super.getDefaultQueryParameters()
    queryParameters.weapon = null
    queryParameters.category = null
    queryParameters.quality = null
    queryParameters.rarity = null
    queryParameters.statTrak = null
    queryParameters.souvenir = null
    queryParameters.search = ''
    return queryParameters
  }

  renderFilter () {
    return <Filter onChange={this.handleFilterChanged} defaultValues={this.state.queryParameters} />
  }

  renderChild (skin) {
    return <Skin key={skin.id} skin={skin} onImageClicked={() => this.handleImageClicked(skin)} />
  }
}

export default withApollo(SkinList)
