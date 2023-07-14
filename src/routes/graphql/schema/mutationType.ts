import { GraphQLObjectType } from 'graphql';
import { createUserField, updateUserField, deleteUserField } from '../types/userTypes.js';
import {
  createProfileField,
  updateProfileField,
  deleteProfileField,
} from '../types/profileTypes.js';
import { createPostField, updatePostField, deletePostField } from '../types/postTypes.js';

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createUser: createUserField,
    updateUser: updateUserField,
    deleteUser: deleteUserField,

    createProfile: createProfileField,
    updateProfile: updateProfileField,
    deleteProfile: deleteProfileField,

    createPost: createPostField,
    updatePost: updatePostField,
    deletePost: deletePostField,

    //Figure out later
    // createMemberType:
    //updateMemberType:
    //deleteMemberType:
  },
});

export default mutationType;
