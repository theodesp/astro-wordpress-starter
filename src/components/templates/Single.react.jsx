import { gql } from "graphql-request";

export default function Component(props) {
  if (props.loading) {
    return null;
  }
  return <div dangerouslySetInnerHTML={{__html: props.data.post.content}}></div>;
}

Component.query = gql`
  query GetPost($databaseId: ID!, $asPreview: Boolean) {
    post(id: $databaseId, idType: DATABASE_ID, asPreview: $asPreview) {
      title
      content
    }
  }
`;

Component.variables = ({databaseId},ctx) => {
  return {
    databaseId,
    asPreview: ctx?.asPreview,
  };
};
