import { FastifyInstance } from 'fastify';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
} from 'graphql';

interface IProfileTypeArgs {
  id: string;
}

interface ICreateProfileArgs {
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}

interface IUpdateProfileArgs {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
}

// Types
const profileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    id: {
      // TODO: Figure out uuid type
      type: GraphQLString,
    },
    isMale: {
      type: GraphQLBoolean,
    },
    yearOfBirth: {
      type: new GraphQLScalarType(GraphQLInt),
    },
    userId: {
      // TODO: Check later
      type: GraphQLID,
    },
    memberTypeId: {
      // TODO: Check later
      type: GraphQLID,
    },
  },
});

const manyProfilesType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(profileType)),
);

// Args
const profileTypeArgs = {
  id: {
    type: GraphQLString,
  },
};

const createProfileArgs = {
  isMale: {
    type: new GraphQLNonNull(GraphQLBoolean),
  },
  yearOfBirth: {
    type: new GraphQLNonNull(new GraphQLScalarType(GraphQLInt)),
  },
  userId: {
    // TODO: Check later
    type: new GraphQLNonNull(GraphQLID),
  },
  memberTypeId: {
    // TODO: Check later
    type: new GraphQLNonNull(GraphQLID),
  },
};

const updateProfileArgs = {
  id: {
    type: new GraphQLNonNull(GraphQLString),
  },
  isMale: {
    type: new GraphQLNonNull(GraphQLBoolean),
  },
  yearOfBirth: {
    type: new GraphQLNonNull(new GraphQLScalarType(GraphQLInt)),
  },
  userId: {
    // TODO: Check later
    type: new GraphQLNonNull(GraphQLID),
  },
  memberTypeId: {
    // TODO: Check later
    type: new GraphQLNonNull(GraphQLID),
  },
};

// Resolvers
const profileResolver = async (
  _parent,
  args: IProfileTypeArgs,
  fastify: FastifyInstance,
) => {
  const profile = await fastify.prisma.profile.findUnique({
    where: {
      id: args.id,
    },
  });
  if (profile === null) {
    throw fastify.httpErrors.notFound();
  }
  return profile;
};

const manyProfilesResolver = async (_parent, _args, fastify: FastifyInstance) => {
  return fastify.prisma.profile.findMany();
};

const createProfileResolve = async (
  _parent,
  args: ICreateProfileArgs,
  fastify: FastifyInstance,
) => {
  return fastify.prisma.profile.create({
    data: args,
  });
};

const updateProfileResolver = async (
  _parent,
  args: IUpdateProfileArgs,
  fastify: FastifyInstance,
) => {
  const { id, ...body } = args;
  return fastify.prisma.profile.update({
    where: { id: id },
    data: body,
  });
};

const deleteProfileResolve = async (
  _parent,
  args: IProfileTypeArgs,
  fastify: FastifyInstance,
) => {
  await fastify.prisma.profile.delete({
    where: {
      id: args.id,
    },
  });
};

// Fields
const profileField = {
  type: profileType,
  args: profileTypeArgs,
  resolve: profileResolver,
};

const manyProfilesField = {
  type: manyProfilesType,
  resolve: manyProfilesResolver,
};

const createProfileField = {
  type: profileType,
  args: createProfileArgs,
  resolve: createProfileResolve,
};

const updateProfileField = {
  type: profileType,
  args: updateProfileArgs,
  resolve: updateProfileResolver,
};

const deleteProfileField = {
  type: profileType,
  args: {
    id: { type: GraphQLID },
  },
  resolve: deleteProfileResolve,
};

export {
  profileField,
  manyProfilesField,
  createProfileField,
  updateProfileField,
  deleteProfileField,
};
