import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Button, Form, Icon, List, Loader, Modal, Popup } from 'semantic-ui-react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import * as actions from '../../actions'
import { createListQuery } from '../../api/lists'
import PropTypes from 'prop-types'
import moment from 'moment'
import 'moment/locale/fr'
import client from '../../apollo'

class ListManagementModal extends Component {
  constructor (props) {
    super(props)

    this.state = {
      createMode: false,
      name: '',
      description: ''
    }

    this.handleChangeMode = this.handleChangeMode.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCreateList = this.handleCreateList.bind(this)
  }

  handleChangeMode (createMode) {
    this.setState({ createMode }, () => {
      if (!createMode) {
        this.resetForm()
      }
    })
  }

  handleClose () {
    const { toggleListManagementModal } = this.props
    toggleListManagementModal(false)
    this.handleChangeMode(false)
  }

  handleCreateList () {
    const { name, description } = this.state

    client.mutate({
      mutation: createListQuery,
      variables: {
        name,
        description
      }
    }).then(response => {
      const { lists, setUserLists } = this.props
      const newList = response.data.createList.list
      const updatedLists = [...lists, newList]
      setUserLists(updatedLists)
      this.handleChangeMode(false)
    })
  }

  resetForm () {
    this.setState({ name: '', description: '' })
  }

  renderCreateList () {
    const { name, description } = this.state
    const { t } = this.props
    return (
      <Form onSubmit={this.handleCreateList}>
        <Form.Input
          label={t('lists.creation.name_label')} required value={name}
          onChange={e => this.setState({ name: e.target.value })}
        />
        <Form.TextArea
          label={t('lists.creation.description_label')} value={description}
          onChange={e => this.setState({ description: e.target.value })}
        />
        <Button onClick={() => this.handleChangeMode(false)}>{t('lists.creation.cancel_button')}</Button>
        <Button type='submit'>{t('lists.creation.confirm_button')}</Button>
      </Form>
    )
  }

  renderLists () {
    const { lists, t } = this.props
    if (lists === null) {
      return <Loader active inverted inline='centered' />
    }

    return (
      <List>
        {lists.map(list => (
          <List.Item key={list.id}>
            <List.Content floated='right'>
              <List.Description>
                <div className='details-icon'>
                  {moment(list.updateDate).fromNow()}
                  <Popup trigger={<Icon name='clock outline' />} content={t('lists.lists.last_update_tooltip')} />
                </div>
                <div className='details-icon'>
                  {list.countItems || 0}
                  <Popup trigger={<Icon name='shopping basket' />} content={t('lists.lists.number_of_items_tooltip')} />
                </div>
              </List.Description>
            </List.Content>
            <List.Content>
              <List.Header as={Link} to={`/lists/${list.id}/${list.slug}/`} onClick={this.handleClose}>{list.name}</List.Header>
              <List.Description>{list.description}</List.Description>
            </List.Content>
          </List.Item>
        ))}
      </List>
    )
  }

  render () {
    const { createMode } = this.state
    const { open, toggleListManagementModal, user, t } = this.props
    if (!user) {
      open && toggleListManagementModal(false)
      return null
    }
    return (
      <Modal open={open} onClose={this.handleClose} className='list-management-modal'>
        <Modal.Header>
          {createMode && (
            <>{t('lists.creation.title')}</>
          )}
          {!createMode && (
            <>
              <Button floated='right' icon='add' onClick={() => this.handleChangeMode(true)} />
              {t('lists.lists.title')}
            </>
          )}
        </Modal.Header>
        <Modal.Content scrolling>
          {createMode && this.renderCreateList()}
          {!createMode && this.renderLists()}
        </Modal.Content>
      </Modal>
    )
  }
}

ListManagementModal.propTypes = {
  open: PropTypes.bool.isRequired,
  user: PropTypes.object,
  lists: PropTypes.array,
  setUserLists: PropTypes.func.isRequired,
  toggleListManagementModal: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

const mapStateToProps = state => {
  return {
    open: state.views.openListManagementModal,
    user: state.main.user,
    lists: state.main.lists
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    actions
  )(ListManagementModal)
)
