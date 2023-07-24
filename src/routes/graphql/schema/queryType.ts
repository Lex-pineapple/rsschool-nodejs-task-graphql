import { GraphQLObjectType } from 'graphql';
import { memberTypeField, manyMemberTypesField } from '../types/memberTypeType.js';
import { postField, manyPostsField } from '../types/postTypes.js';
import { profileField, manyProfilesField } from '../types/profileTypes.js';
import { userField, manyUsersField } from '../types/userTypes.js';

const queryType = new GraphQLObjectType({
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
});

export default queryType;
