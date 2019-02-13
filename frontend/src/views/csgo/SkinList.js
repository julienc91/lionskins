import React from 'react'
import { Helmet } from 'react-helmet'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import Skin from '../../components/csgo/Skin'
import Filter from '../../components/csgo/Filter'
import { Card, Header, Icon, Loader } from 'semantic-ui-react'
import Breadcrumb from '../../components/tools/Breadcrumb'
import InfiniteScroll from 'react-infinite-scroller'
import Lightbox from 'react-images'
import PropTypes from 'prop-types'

class SkinList extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      expandFilter: false,
      lightboxSkins: null
    }
  }

  componentDidMount () {
    const { getSkinList, resetSkinList } = this.props
    resetSkinList()
    getSkinList()
  }

  renderChild (skin) {
    return <Skin key={skin.id} skin={skin} onImageClicked={() => this.handleImageClicked(skin)} />
  }

  handleImageClicked (skin) {
    if (skin.imageUrl) {
      this.setState({
        lightboxSkins: skin
      })
    }
  }

  render () {
    const { getSkinList, hasNextPage, skins, t } = this.props
    const { expandFilter, lightboxSkins } = this.state

    return (
      <div className={'skin-list-container'}>
        <Helmet
          title={t('csgo.skin_list.page_title')}
        />

        <div className={'skin-list-filter' + (expandFilter ? ' expanded' : '')}>
          <Filter />
          <div className='expand-button' onClick={() => this.setState({ expandFilter: !this.state.expandFilter })}>
            <Icon name={'caret ' + (expandFilter ? 'up' : 'down')} />
          </div>
        </div>

        <div className={'skin-list'}>

          <div className='breadcrumb-container'>
            <Breadcrumb items={[{ name: 'Counter-Strike: Global Offensive' }]} />
          </div>

          {(skins.length || hasNextPage) ? (
            <InfiniteScroll
              initialLoad={false}
              loadMore={getSkinList}
              hasMore={hasNextPage}
              loader={<Loader active inline='centered' key='loader' />}
            >
              <Card.Group>
                {skins.map((skin) => this.renderChild(skin))}
              </Card.Group>
            </InfiniteScroll>
          ) : (
            <Header as='h2' icon className='no-results'>
              <Icon name='frown outline' />
              {t('skin_list.no_results.title')}
              <Header.Subheader>{t('skin_list.no_results.subtitle')}</Header.Subheader>
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
  getSkinList: PropTypes.func.isRequired,
  resetSkinList: PropTypes.func.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  skins: PropTypes.arrayOf(
    PropTypes.shape({
      rarity: PropTypes.string,
      statTrak: PropTypes.bool.isRequired,
      souvenir: PropTypes.bool.isRequired,
      prices: PropTypes.arrayOf(
        PropTypes.shape({
          price: PropTypes.number.isRequired,
          currency: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired,
  t: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    skins: state.csgo.skins,
    hasNextPage: state.csgo.hasNextPage
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    actions
  )(SkinList)
)
