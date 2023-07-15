import { FastifyInstance } from 'fastify';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { memberTypeId } from './memberTypeId.js';
import { memberType } from './memberTypeType.js';

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
      type: UUIDType,
    },
    isMale: {
      type: GraphQLBoolean,
    },
    yearOfBirth: {
      type: GraphQLInt,
    },
    userId: {
      type: UUIDType,
    },
    memberTypeId: {
      type: memberTypeId,
    },
    memberType: {
      type: memberType,
    },
  },
});

const manyProfilesType = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(profileType)),
);

// Args
const profileTypeArgs = {
  id: {
    type: UUIDType,
  },
};

const createProfileArgs = {
  isMale: {
    type: new GraphQLNonNull(GraphQLBoolean),
  },
  yearOfBirth: {
    type: new GraphQLNonNull(GraphQLInt),
  },
  userId: {
    type: new GraphQLNonNull(UUIDType),
  },
  memberTypeId: {
    type: new GraphQLNonNull(memberTypeId),
  },
};

const updateProfileArgs = {
  id: {
    type: new GraphQLNonNull(UUIDType),
  },
  isMale: {
    type: new GraphQLNonNull(GraphQLBoolean),
  },
  yearOfBirth: {
    type: new GraphQLNonNull(GraphQLInt),
  },
  userId: {
    type: new GraphQLNonNull(UUIDType),
  },
  memberTypeId: {
    type: new GraphQLNonNull(memberTypeId),
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
    id: { type: UUIDType },
  },
  resolve: deleteProfileResolve,
};

export {
  profileType,
  profileField,
  manyProfilesField,
  createProfileField,
  updateProfileField,
  deleteProfileField,
};
