import { GraphQLClient } from 'graphql-request'

const client = new GraphQLClient('http://mysite.local/graphql', { headers: {} })
export default client;