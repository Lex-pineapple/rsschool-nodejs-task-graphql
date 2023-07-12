import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { manyUsersField, userField } from './types/userTypes.js';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
      user: userField,
      users: manyUsersField,
      // post:,
      // posts:,
      // profile:,
      // profiles:,
      // memberType:,
      // memberTypes:,
    },
  }),
});

export default schema;
