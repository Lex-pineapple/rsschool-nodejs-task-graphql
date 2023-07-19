import { GraphQLObjectType } from 'graphql';
import {
  createUserField,
  changeUserField,
  deleteUserField,
  subscribeToField,
  unsubscribeFromField,
} from '../types/userTypes.js';
import {
  createProfileField,
  changeProfileField,
  deleteProfileField,
} from '../types/profileTypes.js';
import { createPostField, changePostField, deletePostField } from '../types/postTypes.js';

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: createUserField,
    changeUser: changeUserField,
    deleteUser: deleteUserField,

    createProfile: createProfileField,
    changeProfile: changeProfileField,
    deleteProfile: deleteProfileField,

    createPost: createPostField,
    changePost: changePostField,
    deletePost: deletePostField,

    subscribeTo: subscribeToField,
    unsubscribeFrom: unsubscribeFromField,

    //Figure out later
    // createMemberType:
    //updateMemberType:
    //deleteMemberType:
  },
});

export default mutationType;
