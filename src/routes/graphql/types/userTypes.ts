import { FastifyInstance } from 'fastify';
import {
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
} from 'graphql';

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
const userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {
      // TODO: Figure out uuid type
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    balance: {
      type: new GraphQLScalarType(GraphQLFloat),
    },
  },
});

const manyUsersType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType)));

// Args
const userTypeArgs = {
  id: { type: GraphQLString },
};

const createUserArgs = {
  name: {
    type: new GraphQLNonNull(GraphQLString),
  },
  balance: {
    type: new GraphQLNonNull(new GraphQLScalarType(GraphQLFloat)),
  },
};

const updateUserArgs = {
  id: {
    type: new GraphQLNonNull(GraphQLString),
  },
  name: {
    type: GraphQLString,
  },
  balance: {
    type: new GraphQLScalarType(GraphQLFloat),
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
    id: { type: GraphQLID },
  },
  resolve: deleteUserResolve,
};

export { userField, manyUsersField, createUserField, updateUserField, deleteUserField };
