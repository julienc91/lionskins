import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Container, Header, Icon, Button } from 'semantic-ui-react'

class PageNotFound extends Component {
  render () {
    return (
      <Container>
        <Header as='h1' icon className='no-results'>
          <Icon name='frown outline' />
          Page not found
          <Header.Subheader>The page you were looking for cannot be found</Header.Subheader>
          <Header.Subheader>
            <Link to='/'>
              <Button primary>
                Home
              </Button>
            </Link>
          </Header.Subheader>
        </Header>
      </Container>
    )
  }
}

export default PageNotFound
