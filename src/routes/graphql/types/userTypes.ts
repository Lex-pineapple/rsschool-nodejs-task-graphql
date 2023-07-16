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
      data: args.dto,
    });
  };

  static updateResolver = async (
    _parent,
    args: IUpdateUserArgs,
    fastify: FastifyInstance,
  ) => {
    return fastify.prisma.user.update({
      where: { id: args.id },
      data: args.dto,
    });
  };

  static deleteResolver = async (
    _parent,
    args: IDeleteUserTypeArgs,
    fastify: FastifyInstance,
  ) => {
    console.log(args);

    await fastify.prisma.user.delete({
      where: {
        id: args.id,
      },
    });
    return null;
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

export {
  userField,
  manyUsersField,
  createUserField,
  changeUserField,
  deleteUserField,
  User,
};
