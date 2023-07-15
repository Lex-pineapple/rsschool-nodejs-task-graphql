import { FastifyInstance } from 'fastify';
import {
  GraphQLBoolean,
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

  static argsCreate = {
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

  static argsUpdate = {
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
    // if (profile === null) {
    //   throw fastify.httpErrors.notFound();
    // }
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
    // if (profile === null) {
    //   throw fastify.httpErrors.notFound();
    // }
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
      data: args,
    });
  };

  static updateResolver = async (
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

// Types
// const profileType: GraphQLObjectType = new GraphQLObjectType({
//   name: 'Profile',
//   fields: () => ({
//     id: {
//       type: UUIDType,
//     },
//     isMale: {
//       type: GraphQLBoolean,
//     },
//     yearOfBirth: {
//       type: GraphQLInt,
//     },
//     userId: {
//       type: UUIDType,
//     },
//     user: {
//       type: userType,
//       resolve: profileUserResolver,
//     },
//     memberTypeId: {
//       type: memberTypeId,
//     },
//     memberType: {
//       type: memberType,
//       resolve: profileMemberTypeResolver,
//     },
//   }),
// });

// const manyProfilesType = new GraphQLNonNull(
//   new GraphQLList(new GraphQLNonNull(profileType)),
// );

// Args
// const profileTypeArgs = {
//   id: {
//     type: UUIDType,
//   },
// };

// const createProfileArgs = {
//   isMale: {
//     type: new GraphQLNonNull(GraphQLBoolean),
//   },
//   yearOfBirth: {
//     type: new GraphQLNonNull(GraphQLInt),
//   },
//   userId: {
//     type: new GraphQLNonNull(UUIDType),
//   },
//   memberTypeId: {
//     type: new GraphQLNonNull(memberTypeId),
//   },
// };

// const updateProfileArgs = {
//   id: {
//     type: new GraphQLNonNull(UUIDType),
//   },
//   isMale: {
//     type: new GraphQLNonNull(GraphQLBoolean),
//   },
//   yearOfBirth: {
//     type: new GraphQLNonNull(GraphQLInt),
//   },
//   userId: {
//     type: new GraphQLNonNull(UUIDType),
//   },
//   memberTypeId: {
//     type: new GraphQLNonNull(memberTypeId),
//   },
// };

// Resolvers
// const profileResolver = async (
//   _parent,
//   args: IProfileTypeArgs,
//   fastify: FastifyInstance,
// ) => {
//   const profile = await fastify.prisma.profile.findUnique({
//     where: {
//       id: args.id,
//     },
//   });
//   if (profile === null) {
//     throw fastify.httpErrors.notFound();
//   }
//   return profile;
// };

// const profileResolverFromParent = async (
//   parent: IUserType,
//   _args,
//   fastify: FastifyInstance,
// ) => {
//   const profile = await fastify.prisma.profile.findUnique({
//     where: {
//       userId: parent.id,
//     },
//   });
//   if (profile === null) {
//     throw fastify.httpErrors.notFound();
//   }
//   return profile;
// };

// const manyProfilesResolver = async (_parent, _args, fastify: FastifyInstance) => {
//   return fastify.prisma.profile.findMany();
// };

// const createProfileResolve = async (
//   _parent,
//   args: ICreateProfileArgs,
//   fastify: FastifyInstance,
// ) => {
//   return fastify.prisma.profile.create({
//     data: args,
//   });
// };

// const updateProfileResolver = async (
//   _parent,
//   args: IUpdateProfileArgs,
//   fastify: FastifyInstance,
// ) => {
//   const { id, ...body } = args;
//   return fastify.prisma.profile.update({
//     where: { id: id },
//     data: body,
//   });
// };

// const deleteProfileResolve = async (
//   _parent,
//   args: IProfileTypeArgs,
//   fastify: FastifyInstance,
// ) => {
//   await fastify.prisma.profile.delete({
//     where: {
//       id: args.id,
//     },
//   });
// };

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
  args: Profile.argsCreate,
  resolve: Profile.createResolver,
};

const updateProfileField = {
  type: Profile.type,
  args: Profile.argsUpdate,
  resolve: Profile.updateResolver,
};

const deleteProfileField = {
  type: Profile.type,
  args: {
    id: { type: UUIDType },
  },
  resolve: Profile.deleteResolver,
};

export {
  profileField,
  manyProfilesField,
  createProfileField,
  updateProfileField,
  deleteProfileField,
  Profile,
};
