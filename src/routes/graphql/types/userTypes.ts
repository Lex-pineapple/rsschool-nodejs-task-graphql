import { FastifyInstance } from 'fastify';
import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { IProfileType, Profile } from './profileTypes.js';
import { IPostType, Post } from './postTypes.js';

// Interfaces
export interface IUserType {
  id: string;
  name: string;
  balance: number;
  profile: IProfileType;
  posts: IPostType[];
  userSubscribedTo: IUserType[];
  subscribedToUser: IUserType[];
}

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

class User {
  // Types
  static type: GraphQLObjectType = new GraphQLObjectType({
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
      profile: {
        type: Profile.type,
        resolve: Profile.profileFromParentResolver,
      },
      posts: {
        type: new GraphQLList(Post.type),
        resolve: Post.postFromParentResolver,
      },
      subscribedToUser: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User.type))),
        resolve: User.subscribedToUserResolver,
      },
      userSubscribedTo: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User.type))),
        resolve: User.userSubscribedToResolver,
      },
    }),
  });

  static arrayType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(User.type)));

  // Args
  static argsGet = {
    id: { type: UUIDType },
  };

  static argsCreate = {
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
  };

  static argsUpdate = {
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
  static getResolver = async (_parent, args: IUserTypeArgs, fastify: FastifyInstance) => {
    const user = await fastify.prisma.user.findUnique({
      where: {
        id: args.id,
      },
    });
    // if (user === null) {
    //   throw fastify.httpErrors.notFound();
    // }
    return user;
  };

  static usersFromProfileResolver = async (
    parent: IProfileType,
    _args,
    fastify: FastifyInstance,
  ) => {
    const user = await fastify.prisma.user.findUnique({
      where: {
        id: parent.userId,
      },
    });
    // if (user === null) {
    //   throw fastify.httpErrors.notFound();
    // }
    return user;
  };

  static usersFromPostResolver = async (
    parent: IPostType,
    _args,
    fastify: FastifyInstance,
  ) => {
    const user = await fastify.prisma.user.findUnique({
      where: {
        id: parent.authorId,
      },
    });
    // if (user === null) {
    //   throw fastify.httpErrors.notFound();
    // }
    return user;
  };

  static getManyResolver = async (_parent, _args, fastify: FastifyInstance) => {
    return fastify.prisma.user.findMany();
  };

  static subscribedToUserResolver = async (
    parent: IUserTypeArgs,
    _args,
    fastify: FastifyInstance,
  ) => {
    return fastify.prisma.user.findMany({
      where: {
        userSubscribedTo: {
          some: {
            authorId: parent.id,
          },
        },
      },
    });
  };

  static userSubscribedToResolver = async (
    parent: IUserTypeArgs,
    _args,
    fastify: FastifyInstance,
  ) => {
    return fastify.prisma.user.findMany({
      where: {
        subscribedToUser: {
          some: {
            subscriberId: parent.id,
          },
        },
      },
    });
  };

  static createResolver = async (
    _parent,
    args: ICreateUserArgs,
    fastify: FastifyInstance,
  ) => {
    return fastify.prisma.user.create({
      data: args,
    });
  };

  static updateResolver = async (
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

  static deleteResolver = async (
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
}

// Types
// const userType: GraphQLObjectType = new GraphQLObjectType({
//   name: 'User',
//   fields: () => ({
//     id: {
//       type: UUIDType,
//     },
//     name: {
//       type: GraphQLString,
//     },
//     balance: {
//       type: GraphQLFloat,
//     },
//     profile: {
//       type: profileType,
//       resolve: profileResolverFromParent,
//     },
//     posts: {
//       type: new GraphQLList(postType),
//       resolve: postResolverFromParent,
//     },
//     subscribedToUser: {
//       type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType))),
//       resolve: subscribedToUserResolver,
//     },
//     userSubscribedTo: {
//       type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType))),
//       resolve: userSubscribedToResolver,
//     },
//   }),
// });

// const manyUsersType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType)));

// Args
// const userTypeArgs = {
//   id: { type: UUIDType },
// };

// const createUserArgs = {
//   name: {
//     type: new GraphQLNonNull(GraphQLString),
//   },
//   balance: {
//     type: new GraphQLNonNull(GraphQLFloat),
//   },
// };

// const updateUserArgs = {
//   id: {
//     type: new GraphQLNonNull(UUIDType),
//   },
//   name: {
//     type: GraphQLString,
//   },
//   balance: {
//     type: GraphQLFloat,
//   },
// };

// Resolvers
// const userResolver = async (_parent, args: IUserTypeArgs, fastify: FastifyInstance) => {
//   const user = await fastify.prisma.user.findUnique({
//     where: {
//       id: args.id,
//     },
//   });
//   if (user === null) {
//     throw fastify.httpErrors.notFound();
//   }
//   return user;
// };

// const profileUserResolver = async (
//   parent: IProfileType,
//   _args,
//   fastify: FastifyInstance,
// ) => {
//   const user = await fastify.prisma.user.findUnique({
//     where: {
//       id: parent.userId,
//     },
//   });
//   if (user === null) {
//     throw fastify.httpErrors.notFound();
//   }
//   return user;
// };

// const postUserResolver = async (parent: IPostType, _args, fastify: FastifyInstance) => {
//   const user = await fastify.prisma.user.findUnique({
//     where: {
//       id: parent.authorId,
//     },
//   });
//   if (user === null) {
//     throw fastify.httpErrors.notFound();
//   }
//   return user;
// };

// const manyUsersResolver = async (_parent, _args, fastify: FastifyInstance) => {
//   return fastify.prisma.user.findMany();
// };

// const subscribedToUserResolver = async (
//   parent: IUserTypeArgs,
//   _args,
//   fastify: FastifyInstance,
// ) => {
//   return fastify.prisma.user.findMany({
//     where: {
//       subscribedToUser: {
//         every: {
//           authorId: parent.id,
//         },
//       },
//     },
//   });
// };

// const userSubscribedToResolver = async (
//   parent: IUserTypeArgs,
//   _args,
//   fastify: FastifyInstance,
// ) => {
//   return fastify.prisma.user.findMany({
//     where: {
//       userSubscribedTo: {
//         every: {
//           subscriberId: parent.id,
//         },
//       },
//     },
//   });
// };

// const createUserResolve = async (
//   _parent,
//   args: ICreateUserArgs,
//   fastify: FastifyInstance,
// ) => {
//   return fastify.prisma.user.create({
//     data: args,
//   });
// };

// const updateUserResolve = async (
//   _parent,
//   args: IUpdateUserArgs,
//   fastify: FastifyInstance,
// ) => {
//   const { id, ...body } = args;
//   return fastify.prisma.user.update({
//     where: { id: id },
//     data: body,
//   });
// };

// const deleteUserResolve = async (
//   _parent,
//   args: IUserTypeArgs,
//   fastify: FastifyInstance,
// ) => {
//   await fastify.prisma.user.delete({
//     where: {
//       id: args.id,
//     },
//   });
// };

// Fields
const userField = {
  type: User.type,
  args: User.argsGet,
  resolve: User.getResolver,
};

const manyUsersField = {
  type: User.arrayType,
  resolve: User.getManyResolver,
};

const createUserField = {
  type: User.type,
  args: User.argsCreate,
  resolve: User.createResolver,
};

const updateUserField = {
  type: User.type,
  args: User.argsUpdate,
  resolve: User.updateResolver,
};

const deleteUserField = {
  type: User.type,
  args: {
    id: { type: UUIDType },
  },
  resolve: User.deleteResolver,
};

export {
  userField,
  manyUsersField,
  createUserField,
  updateUserField,
  deleteUserField,
  User,
};
