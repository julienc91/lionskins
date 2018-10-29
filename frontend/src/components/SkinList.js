import React, { Component } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import { Header, Card, Loader, Icon } from 'semantic-ui-react'
import Lightbox from 'react-images'
import PropTypes from 'prop-types'
import Breadcrumb from './Breadcrumb'

class SkinList extends Component {
  constructor (props) {
    super(props)

    const params = window.location.hash.substr(1).split('&')
    let queryParameters = this.getDefaultQueryParameters()

    params.forEach(param => {
      const parsedParam = param.split('=')
      const filter = parsedParam[0]
      let value = parsedParam[1]

      if (filter !== 'first' && filter !== 'after' && queryParameters[filter] !== undefined) {
        if (value === 'true') {
          value = true
        } else if (value === 'false') {
          value = false
        }
        queryParameters[filter] = value
      }
    })

    this.state = {
      breadcrumb: [],
      skins: [],
      expandFilter: false,
      hasNextPage: true,
      queryParameters: queryParameters,
      lightboxSkins: null
    }

    this.executeQuery = this.executeQuery.bind(this)
  }

  componentDidMount () {
    return this.executeQuery()
  }

  getDefaultQueryParameters () {
    return {
      first: 50,
      after: ''
    }
  }

  renderFilter () {
    return <div />
  }

  renderChild () {
    return <div />
  }

  handleFilterChanged (filters) {
    const updatedQueryParameters = { ...this.state.queryParameters }
    updatedQueryParameters.after = ''

    Object.keys(filters).map(filter => {
      updatedQueryParameters[filter] = filters[filter]
      return filters[filter]
    })

    this.setState({
      skins: [],
      filteredSkins: [],
      hasNextPage: true,
      queryParameters: updatedQueryParameters
    }, () => {
      this.executeQuery()

      let hash = []
      let defaultParameters = this.getDefaultQueryParameters()

      Object.keys(updatedQueryParameters).forEach(filter => {
        if (filter === 'first' || filter === 'after' || updatedQueryParameters[filter] === defaultParameters[filter]) {
          return
        }

        hash.push(`${filter}=${updatedQueryParameters[filter]}`)
      })
      window.location.hash = '#' + hash.join('&')
    })
  }

  handleImageClicked (skin) {
    if (skin.imageUrl) {
      this.setState({
        lightboxSkins: skin
      })
    }
  }

  async executeQuery () {
    const { queryParameters } = this.state
    const result = await this.props.client.query({
      query: this.query,
      variables: queryParameters
    })

    if (this.state.queryParameters !== queryParameters) { return }

    let updatedQueryParameters = { ...this.state.queryParameters }
    updatedQueryParameters.after = result.data[this.rootName].pageInfo.endCursor

    this.setState({
      skins: [...this.state.skins, ...result.data[this.rootName].edges.map(e => e.node)],
      hasNextPage: result.data[this.rootName].pageInfo.hasNextPage,
      queryParameters: updatedQueryParameters
    })
  }

  render () {
    const { breadcrumb, expandFilter, lightboxSkins, skins, hasNextPage } = this.state

    return (
      <div className={'skin-list-container'}>

        <div className={'skin-list-filter' + (expandFilter ? ' expanded' : '')}>
          {this.renderFilter()}
          <div className='expand-button' onClick={() => this.setState({ expandFilter: !this.state.expandFilter })}>
            <Icon name={'caret ' + (expandFilter ? 'up' : 'down')} />
          </div>
        </div>

        <div className={'skin-list'}>

          <div className='breadcrumb-container'>
            <Breadcrumb items={breadcrumb} />
          </div>

          {(skins.length || hasNextPage) ? (
            <InfiniteScroll
              initialLoad={false}
              loadMore={this.executeQuery}
              hasMore={hasNextPage}
              loader={<Loader active inline='centered' key='loader' />}
            >
              <Card.Group>
                {skins.map(this.renderChild.bind(this))}
              </Card.Group>
            </InfiniteScroll>
          ) : (
            <Header as='h2' icon className='no-results'>
              <Icon name='frown outline' />
              No results
              <Header.Subheader>We didn't find anything matching your criteria</Header.Subheader>
            </Header>
          )}
        </div>
        <Lightbox
          images={[{
            src: lightboxSkins ? lightboxSkins.imageUrl : '',
            caption: lightboxSkins ? lightboxSkins.name : ''
          }]}
          isOpen={!!lightboxSkins}
          onClose={() => this.setState({ lightboxSkins: null })}
          backdropClosesModal
          showCloseButton={false}
          showImageCount={false}
          className='lightbox'
          theme={{
            image: {
              'background-color': '#E4E9EC'
            }
          }}
        />
      </div>
    )
  }
}

SkinList.propTypes = {
  client: PropTypes.object.isRequired
}

export default SkinList
