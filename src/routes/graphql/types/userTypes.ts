import { FastifyInstance } from 'fastify';
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { IProfileType, Profile } from './profileTypes.js';
import { IPostType, Post } from './postTypes.js';
import { IGraphqlContext } from '../dataloaders.js';

export interface IUser {
  id: string;
  name: string;
  balance: number;
}

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

export interface IDeleteUserTypeArgs {
  id: string;
}

export interface ICreateUserArgs {
  dto: {
    name: string;
    balance: number;
  };
}

export interface IUpdateUserArgs {
  id: string;
  dto: {
    name?: string;
    balance?: number;
  };
}

export interface ISubscribeArgs {
  userId: string;
  authorId: string;
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

  static argsCreate: GraphQLInputObjectType = new GraphQLInputObjectType({
    name: 'CreateUserInput',
    fields: () => ({
      name: {
        type: new GraphQLNonNull(GraphQLString),
      },
      balance: {
        type: new GraphQLNonNull(GraphQLFloat),
      },
    }),
  });

  static argsUpdate: GraphQLInputObjectType = new GraphQLInputObjectType({
    name: 'ChangeUserInput',
    fields: () => ({
      name: {
        type: GraphQLString,
      },
      balance: {
        type: GraphQLFloat,
      },
    }),
  });

  // Resolvers
  static getResolver = async (
    _parent,
    args: IUserTypeArgs,
    { fastify, dataloaders }: IGraphqlContext,
  ) => {
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
    { fastify, dataloaders }: IGraphqlContext,
  ) => {
    const user = await fastify.prisma.user.findUnique({
      where: {
        id: parent.userId,
      },
    });
    return user;
  };

  static usersFromPostResolver = async (
    parent: IPostType,
    _args,
    fastify: FastifyInstance,
  ) => {
    const user = await fastify.prisma.user.findMany({
      where: {
        id: parent.authorId,
      },
    });
    return user;
  };

  static getManyResolver = async (
    _parent,
    _args,
    { fastify, dataloaders }: IGraphqlContext,
  ) => {
    return fastify.prisma.user.findMany();
  };

  static subscribedToUserResolver = async (
    parent: IUserTypeArgs,
    _args,
    { fastify, dataloaders }: IGraphqlContext,
  ) => {
    return await dataloaders.subscribedToUserLoader.load(parent.id);
    // return fastify.prisma.user.findMany({
    //   where: {
    //     userSubscribedTo: {
    //       some: {
    //         authorId: parent.id,
    //       },
    //     },
    //   },
    // });
  };

  static userSubscribedToResolver = async (
    parent: IUserTypeArgs,
    _args,
    { fastify, dataloaders }: IGraphqlContext,
  ) => {
    return await dataloaders.userSubscribedToLoader.load(parent.id);
    // return fastify.prisma.user.findMany({
    //   where: {
    //     subscribedToUser: {
    //       some: {
    //         subscriberId: parent.id,
    //       },
    //     },
    //   },
    // });
  };

  static createResolver = async (
    _parent,
    args: ICreateUserArgs,
    { fastify, dataloaders }: IGraphqlContext,
  ) => {
    return fastify.prisma.user.create({
      data: args.dto,
    });
  };

  static updateResolver = async (
    _parent,
    args: IUpdateUserArgs,
    { fastify, dataloaders }: IGraphqlContext,
  ) => {
    return fastify.prisma.user.update({
      where: { id: args.id },
      data: args.dto,
    });
  };

  static deleteResolver = async (
    _parent,
    args: IDeleteUserTypeArgs,
    { fastify, dataloaders }: IGraphqlContext,
  ) => {
    await fastify.prisma.user.delete({
      where: {
        id: args.id,
      },
    });
    return null;
  };

  static subscribeResolver = async (
    _parent,
    args: ISubscribeArgs,
    { fastify, dataloaders }: IGraphqlContext,
  ) => {
    // return await fastify.prisma.user.update({
    //   where: { id: args.authorId },
    //   data: {
    //     subscribedToUser: {
    //       create: {
    //         subscriberId: args.userId,
    //       },
    //     },
    //   },
    // });

    return fastify.prisma.user.update({
      where: { id: args.userId },
      data: {
        userSubscribedTo: {
          create: {
            authorId: args.authorId,
          },
        },
      },
    });
  };

  static unsubscribeResolver = async (
    _parent,
    args: ISubscribeArgs,
    { fastify, dataloaders }: IGraphqlContext,
  ) => {
    await fastify.prisma.user.update({
      where: {
        id: args.userId,
      },
      data: {
        userSubscribedTo: {
          deleteMany: {
            authorId: args.authorId,
          },
        },
      },
    });
  };
}

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
  args: {
    dto: {
      type: new GraphQLNonNull(User.argsCreate),
    },
  },
  resolve: User.createResolver,
};

const changeUserField = {
  type: User.type,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: {
      type: new GraphQLNonNull(User.argsUpdate),
    },
  },
  resolve: User.updateResolver,
};

const deleteUserField = {
  type: GraphQLBoolean,
  args: {
    id: { type: UUIDType },
  },
  resolve: User.deleteResolver,
};

const subscribeToField = {
  type: User.type,
  args: {
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: User.subscribeResolver,
};

const unsubscribeFromField = {
  type: GraphQLBoolean,
  args: {
    userId: {
      type: new GraphQLNonNull(UUIDType),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  },
  resolve: User.unsubscribeResolver,
};

export {
  userField,
  manyUsersField,
  createUserField,
  changeUserField,
  deleteUserField,
  subscribeToField,
  unsubscribeFromField,
  User,
};
