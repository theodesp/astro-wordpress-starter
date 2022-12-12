import { gql } from "graphql-request";

export default function Component(props) {
  return <div dangerouslySetInnerHTML={{__html: props.post.content}}></div>;
}

Component.query = gql`
  query GetPost($databaseId: ID!) {
    post(id: $databaseId, idType: DATABASE_ID) {
      title
      content
    }
  }
`;

Component.variables = ({databaseId}) => {
  return {
    databaseId
  };
};
