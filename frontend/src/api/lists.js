import gql from 'graphql-tag'

export const getUserListsQuery = gql`
  query {
    currentUserLists {
      edges {
        node {
          id,
          description,
          name,
          slug,
          countItems,
          creationDate,
          updateDate
        }
      }
    }
  }`

export const getUserListQuery = gql`
  query($id: ID!) {
    userList(id: $id) {
      id,
      description,
      name,
      slug,
      countItems,
      creationDate,
      updateDate,
      user {
        id,
        username
      }
    }
  }`

export const createListQuery = gql`
  mutation($name: String!, $description: String) {
    createList(name: $name, description: $description) {
      list {
        id,
        description,
        name,
        slug,
        countItems,
        creationDate,
        updateDate
      }
    }
  }`

export const deleteListQuery = gql`
  mutation($id: ID!) {
    deleteList(id: $id) {
      ok
    }
  }`

export const updateListQuery = gql`
  mutation($id: ID!, $name: String, $description: String) {
    updateList(id: $id, name: $name, description: $description) {
      list {
        id,
        description,
        name,
        slug,
        countItems,
        creationDate,
        updateDate
      }
    }
  }`
