import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import { Redirect } from 'react-router-dom'
import { withTranslation } from 'react-i18next'
import { Button, Confirm, Container, Header, Icon } from 'semantic-ui-react'
import { connect } from 'react-redux'
import * as actions from '../actions'
import PropTypes from 'prop-types'
import client from '../apollo'
import { getUserListQuery, deleteListQuery } from '../api/lists'
import PageNotFound from './PageNotFound'
import ListEditModal from '../components/modals/ListEdit'

class UserList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      openDeleteConfirm: false,
      openEdit: false,
      redirectAfterDeletion: false,
      redirectAfterEdit: false,
      list: null,
      loading: false
    }

    this.handleDelete = this.handleDelete.bind(this)
    this.handleListUpdated = this.handleListUpdated.bind(this)
    this.handleToggleEdit = this.handleToggleEdit.bind(this)
  }

  componentDidMount () {
    this.getList()
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.match.params.id !== this.props.match.params.id ||
        prevProps.match.params.slug !== this.props.match.params.slug) {
      this.resetState()
      this.getList()
    }
  }

  resetState () {
    this.setState({
      openDeleteConfirm: false,
      openEdit: false,
      redirectAfterDeletion: false,
      redirectAfterEdit: false,
      list: null,
      loading: false
    })
  }

  getList () {
    this.setState({ loading: true, list: null }, () => {
      const { id, slug } = this.props.match.params
      client.query({
        query: getUserListQuery,
        variables: {
          id
        }
      }).then(response => {
        const list = response.data.userList
        if (list && list.slug === slug) {
          this.setState({ list })
        }
      }).finally(() => {
        this.setState({ loading: false })
      })
    })
  }

  handleDelete () {
    const { list, openDeleteConfirm } = this.state
    if (!openDeleteConfirm) {
      this.setState({ openDeleteConfirm: true })
    } else {
      client.mutate({
        mutation: deleteListQuery,
        variables: {
          id: list.id
        }
      }).then(() => {
        const { lists, setUserLists, toggleListManagementModal } = this.props
        const updatedLists = lists.filter(userList => userList.id !== list.id)
        setUserLists(updatedLists)
        this.setState({ openDeleteConfirm: false, redirectAfterDeletion: true }, () => {
          toggleListManagementModal(true)
        })
      })
    }
  }

  handleToggleEdit (open) {
    this.setState({ openEdit: open })
  }

  handleListUpdated (list) {
    const { lists, setUserLists } = this.props
    const updatedLists = lists.map(userList => {
      if (userList.id === list.id) {
        list.user = userList.user
        return list
      }
      return userList
    })
    if (list.slug !== this.state.list.slug) {
      this.setState({ redirectAfterEdit: true })
    }
    this.setState({ list })
    setUserLists(updatedLists)
    this.handleToggleEdit(false)
  }

  render () {
    const { user, t } = this.props
    const { list, loading, openDeleteConfirm, openEdit, redirectAfterDeletion, redirectAfterEdit } = this.state
    if (!loading && !list) {
      return <PageNotFound />
    } else if (loading) {
      return null
    } else if (redirectAfterDeletion) {
      return <Redirect to='/' />
    } else if (redirectAfterEdit) {
      const updatedUrl = `/lists/${list.id}/${list.slug}/`
      return <Redirect to={updatedUrl} />
    }
    return (
      <Container className='page user-list'>
        <Helmet
          title={list.name}
        />

        {user && user.id === list.user.id && (
          <div className='admin-actions'>
            <Button basic icon='edit' onClick={() => this.handleToggleEdit(true)} />
            <Button basic icon='trash' onClick={this.handleDelete} />

            <Confirm
              content={t('lists.deletion.confirm_description')}
              cancelButton={t('lists.deletion.cancel_button')}
              confirmButton={t('lists.deletion.confirm_button')}
              open={openDeleteConfirm}
              onCancel={() => this.setState({ openDeleteConfirm: false })}
              onConfirm={this.handleDelete}
            />
            <ListEditModal
              open={openEdit}
              list={list}
              onCancel={() => this.handleToggleEdit(false)}
              onListUpdated={this.handleListUpdated}
            />
          </div>
        )}

        <Header>
          <h1>{list.name}</h1>
          <Header.Subheader>
            <Icon name='user' />
            {list.user.username}
          </Header.Subheader>
          {list.description && <h4>{list.description}</h4>}
        </Header>

        <Container>
          todo
        </Container>
      </Container>
    )
  }
}

UserList.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired
    })
  }),
  lists: PropTypes.array,
  user: PropTypes.object,
  setUserLists: PropTypes.func.isRequired,
  toggleListManagementModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    lists: state.main.lists,
    user: state.main.user
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    actions
  )(UserList)
)
