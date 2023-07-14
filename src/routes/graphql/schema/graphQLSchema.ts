import { GraphQLSchema } from 'graphql';
import queryType from './queryType.js';
import mutationType from './mutationType.js';

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

export default schema;
