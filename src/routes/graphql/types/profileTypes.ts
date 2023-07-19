import { FastifyInstance } from 'fastify';
import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { memberTypeId } from './memberTypeId.js';
import { IMemberType, MemberType } from './memberTypeType.js';
import { IUserType, User } from './userTypes.js';

export interface IProfileType {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
  memberTypeId: string;
  user: IUserType;
  memberType: IMemberType;
}

interface IProfileTypeArgs {
  id: string;
}

interface ICreateProfileArgs {
  dto: {
    isMale: boolean;
    yearOfBirth: number;
    userId: string;
    memberTypeId: string;
  };
}

interface IUpdateProfileArgs {
  id: string;
  dto: {
    isMale: boolean;
    yearOfBirth: number;
    userId: string;
    memberTypeId: string;
  };
}

class Profile {
  // Types
  static type: GraphQLObjectType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
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
      user: {
        type: User.type,
        resolve: User.usersFromProfileResolver,
      },
      memberTypeId: {
        type: memberTypeId,
      },
      memberType: {
        type: MemberType.type,
        resolve: MemberType.memberTypeFromProfileResolver,
      },
    }),
  });

  static arrayType = new GraphQLNonNull(
    new GraphQLList(new GraphQLNonNull(Profile.type)),
  );

  // Args
  static argsGet = {
    id: {
      type: UUIDType,
    },
  };

  static argsCreate: GraphQLInputObjectType = new GraphQLInputObjectType({
    name: 'CreateProfileInput',
    fields: () => ({
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
    }),
  });

  static argsUpdate: GraphQLInputObjectType = new GraphQLInputObjectType({
    name: 'ChangeProfileInput',
    fields: () => ({
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
    }),
  });

  // Resolvers
  static getResolver = async (
    _parent,
    args: IProfileTypeArgs,
    fastify: FastifyInstance,
  ) => {
    const profile = await fastify.prisma.profile.findUnique({
      where: {
        id: args.id,
      },
    });
    return profile;
  };

  static getManyResolver = async (_parent, _args, fastify: FastifyInstance) => {
    return fastify.prisma.profile.findMany();
  };

  static profileFromParentResolver = async (
    parent: IUserType,
    _args,
    fastify: FastifyInstance,
  ) => {
    const profile = await fastify.prisma.profile.findUnique({
      where: {
        userId: parent.id,
      },
    });
    return profile;
  };

  static profileFromMemberTypeResolver = async (
    parent: IMemberType,
    _args,
    fastify: FastifyInstance,
  ) => {
    return fastify.prisma.profile.findMany({
      where: {
        memberTypeId: parent.id,
      },
    });
  };

  static createResolver = async (
    _parent,
    args: ICreateProfileArgs,
    fastify: FastifyInstance,
  ) => {
    return fastify.prisma.profile.create({
      data: args.dto,
    });
  };

  static updateResolver = async (
    _parent,
    args: IUpdateProfileArgs,
    fastify: FastifyInstance,
  ) => {
    return fastify.prisma.profile.update({
      where: { id: args.id },
      data: args.dto,
    });
  };

  static deleteResolver = async (
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
}

// Fields
const profileField = {
  type: Profile.type,
  args: Profile.argsGet,
  resolve: Profile.getResolver,
};

const manyProfilesField = {
  type: Profile.arrayType,
  resolve: Profile.getManyResolver,
};

const createProfileField = {
  type: Profile.type,
  args: {
    dto: {
      type: new GraphQLNonNull(Profile.argsCreate),
    },
  },
  resolve: Profile.createResolver,
};

const changeProfileField = {
  type: Profile.type,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: {
      type: new GraphQLNonNull(Profile.argsUpdate),
    },
  },
  resolve: Profile.updateResolver,
};

const deleteProfileField = {
  type: GraphQLBoolean,
  args: {
    id: { type: UUIDType },
  },
  resolve: Profile.deleteResolver,
};

export {
  profileField,
  manyProfilesField,
  createProfileField,
  changeProfileField,
  deleteProfileField,
  Profile,
};
