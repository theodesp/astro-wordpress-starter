import { gql } from 'graphql-request';

export const SEED_QUERY = gql`
  query GetNodeByUri($uri: String!) {
    node: nodeByUri(uri: $uri) {
      ...NodeByUri
    }
  }
  fragment NodeByUri on UniformResourceIdentifiable {
    __typename
    uri
    id
    ...DatabaseIdentifier
    ...ContentType
    ...User
    ...TermNode
    ...ContentNode
    ...MediaItem
    ...Page
  }
  fragment DatabaseIdentifier on DatabaseIdentifier {
    databaseId
  }
  fragment MediaItem on MediaItem {
    id
    mimeType
    title
  }
  fragment ContentType on ContentType {
    name
    isFrontPage
    # This is currently broken. The home page (blog page) can not be
    # resolved when set to a custom page until the below issue is resolved.
    # Link: https://github.com/wp-graphql/wp-graphql/issues/2514
    isPostsPage
  }
  fragment Page on Page {
    isFrontPage
    isPostsPage
    title
  }
  fragment TermNode on TermNode {
    isTermNode
    slug
    taxonomyName
  }
  fragment ContentNode on ContentNode {
    isContentNode
    slug
    contentType {
      node {
        name
      }
    }
    template {
      templateName
    }
  }
  fragment User on User {
    name
    userId
    databaseId
  }
`;