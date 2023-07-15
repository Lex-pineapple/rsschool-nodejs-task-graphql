import fastify, { FastifyInstance } from 'fastify';
import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { profileField, profileType } from './profileTypes.js';
import { manyPostsField, postType } from './postTypes.js';

// Interfaces
export interface IUserTypeArgs {
  id: string;
}

export interface ICreateUserArgs {
  name: string;
  balance: number;
}

export interface IUpdateUserArgs {
  id: string;
  name?: string;
  balance?: number;
}

// Types
const userType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: UUIDType,
    },
    name: {
      type: GraphQLString,
    },
    balance: {
      type: GraphQLFloat,
    },
    profile: profileField,
    posts: manyPostsField,
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType))),
      resolve: subscribedToUserResolver,
    },
    userSubscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType))),
      resolve: userSubscribedToResolver,
    },
  }),
});

const manyUsersType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType)));

// Args
const userTypeArgs = {
  id: { type: UUIDType },
};

const createUserArgs = {
  name: {
    type: new GraphQLNonNull(GraphQLString),
  },
  balance: {
    type: new GraphQLNonNull(GraphQLFloat),
  },
};

const updateUserArgs = {
  id: {
    type: new GraphQLNonNull(UUIDType),
  },
  name: {
    type: GraphQLString,
  },
  balance: {
    type: GraphQLFloat,
  },
};

// Resolvers
const userResolver = async (_parent, args: IUserTypeArgs, fastify: FastifyInstance) => {
  const user = await fastify.prisma.user.findUnique({
    where: {
      id: args.id,
    },
  });
  if (user === null) {
    throw fastify.httpErrors.notFound();
  }
  return user;
};

const manyUsersResolver = async (_parent, _args, fastify: FastifyInstance) => {
  return fastify.prisma.user.findMany();
};

const subscribedToUserResolver = async (
  parent: IUserTypeArgs,
  _args,
  fastify: FastifyInstance,
) => {
  return fastify.prisma.user.findMany({
    where: {
      subscribedToUser: {
        every: {
          authorId: parent.id,
        },
      },
    },
  });
};

const userSubscribedToResolver = async (
  parent: IUserTypeArgs,
  _args,
  fastify: FastifyInstance,
) => {
  return fastify.prisma.user.findMany({
    where: {
      userSubscribedTo: {
        every: {
          subscriberId: parent.id,
        },
      },
    },
  });
};

const createUserResolve = async (
  _parent,
  args: ICreateUserArgs,
  fastify: FastifyInstance,
) => {
  return fastify.prisma.user.create({
    data: args,
  });
};

const updateUserResolve = async (
  _parent,
  args: IUpdateUserArgs,
  fastify: FastifyInstance,
) => {
  const { id, ...body } = args;
  return fastify.prisma.user.update({
    where: { id: id },
    data: body,
  });
};

const deleteUserResolve = async (
  _parent,
  args: IUserTypeArgs,
  fastify: FastifyInstance,
) => {
  await fastify.prisma.user.delete({
    where: {
      id: args.id,
    },
  });
};

// Fields
const userField = {
  type: userType,
  args: userTypeArgs,
  resolve: userResolver,
};

const manyUsersField = {
  type: manyUsersType,
  resolve: manyUsersResolver,
};

const createUserField = {
  type: userType,
  args: createUserArgs,
  resolve: createUserResolve,
};

const updateUserField = {
  type: userType,
  args: updateUserArgs,
  resolve: updateUserResolve,
};

const deleteUserField = {
  type: userType,
  args: {
    id: { type: UUIDType },
  },
  resolve: deleteUserResolve,
};

export {
  userType,
  userField,
  manyUsersField,
  createUserField,
  updateUserField,
  deleteUserField,
};
