import React, { Component } from 'react'
import { Button, Form, Modal } from 'semantic-ui-react'
import { withTranslation } from 'react-i18next'
import { updateListQuery } from '../../api/lists'
import PropTypes from 'prop-types'
import client from '../../apollo'

class ListEditModal extends Component {
  constructor (props) {
    super(props)

    this.state = {
      name: props.list.name,
      description: props.list.description
    }

    this.handleClose = this.handleClose.bind(this)
    this.handleSave = this.handleSave.bind(this)
  }

  handleClose () {
    const { list, onCancel } = this.props
    this.setState({
      name: list.name,
      description: list.description
    })
    onCancel()
  }

  handleSave () {
    const { list } = this.props
    const { name, description } = this.state

    client.mutate({
      mutation: updateListQuery,
      variables: {
        id: list.id,
        name,
        description
      }
    }).then(response => {
      const { onListUpdated } = this.props
      const newList = response.data.updateList.list
      onListUpdated(newList)
    })
  }

  render () {
    const { open, t } = this.props
    const { name, description } = this.state

    return (
      <Modal open={open} onClose={this.handleClose} className='list-management-modal'>
        <Modal.Header>
          {t('lists.edition.title')}
        </Modal.Header>
        <Modal.Content scrolling>
          <Form onSubmit={this.handleSave}>
            <Form.Input
              label={t('lists.edition.name_label')} required value={name}
              onChange={e => this.setState({ name: e.target.value })}
            />
            <Form.TextArea
              label={t('lists.edition.description_label')} value={description}
              onChange={e => this.setState({ description: e.target.value })}
            />
            <Button onClick={this.handleClose}>{t('lists.edition.cancel_button')}</Button>
            <Button type='submit'>{t('lists.edition.confirm_button')}</Button>
          </Form>
        </Modal.Content>
      </Modal>
    )
  }
}

ListEditModal.propTypes = {
  list: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string
  }).isRequired,
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onListUpdated: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
}

export default withTranslation()(ListEditModal)
