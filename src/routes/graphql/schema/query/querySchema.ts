import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { manyUsersField, userField } from '../types/userTypes.js';
import { manyPostsField, postField } from '../types/postTypes.js';
import { manyProfilesField, profileField } from '../types/profileTypes.js';
import { manyMemberTypesField, memberTypeField } from '../types/memberTypeType.js';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
      user: userField,
      users: manyUsersField,
      post: postField,
      posts: manyPostsField,
      profile: profileField,
      profiles: manyProfilesField,
      memberType: memberTypeField,
      memberTypes: manyMemberTypesField,
    },
  }),
});

export default schema;
