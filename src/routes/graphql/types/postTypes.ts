import { FastifyInstance } from 'fastify';
import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { IUserType, User } from './userTypes.js';

export interface IPostType {
  id: string;
  title: string;
  content: string;
  author: IUserType;
  authorId: string;
}

export interface IPostTypeArgs {
  id: string;
}

interface ICreatePostArgs {
  dto: {
    title: string;
    content: string;
    authorId: string;
  };
}

interface IUpdatePostArgs {
  id: string;
  dto: {
    title: string;
    content: string;
    authorId: string;
  };
}

class Post {
  // Types
  static type: GraphQLObjectType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
      id: {
        type: UUIDType,
      },
      title: {
        type: GraphQLString,
      },
      content: {
        type: GraphQLString,
      },
      authorId: {
        type: UUIDType,
      },
      author: {
        type: User.type,
        resolve: User.usersFromPostResolver,
      },
    }),
  });

  static arrayType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(Post.type)));

  // Args
  static argsGet = {
    id: { type: UUIDType },
  };

  static argsCreate = new GraphQLInputObjectType({
    name: 'CreatePostInput',
    fields: () => ({
      title: {
        type: new GraphQLNonNull(GraphQLString),
      },
      content: {
        type: new GraphQLNonNull(GraphQLString),
      },
      authorId: {
        type: new GraphQLNonNull(UUIDType),
      },
    }),
  });

  static argsUpdate = new GraphQLInputObjectType({
    name: 'ChangePostInput',
    fields: () => ({
      title: {
        type: GraphQLString,
      },
      content: {
        type: GraphQLString,
      },
    }),
  });

  // Resolvers
  static getResolver = async (_parent, args: IPostTypeArgs, fastify: FastifyInstance) => {
    const post = await fastify.prisma.post.findUnique({
      where: {
        id: args.id,
      },
    });
    return post;
  };

  static postFromParentResolver = async (
    parent: IUserType,
    _args,
    fastify: FastifyInstance,
  ) => {
    return fastify.prisma.post.findMany({
      where: {
        authorId: parent.id,
      },
    });
  };

  static getManyResolver = async (_parent, _args, fastify: FastifyInstance) => {
    return fastify.prisma.post.findMany();
  };

  static createResolver = async (
    _parent,
    args: ICreatePostArgs,
    fastify: FastifyInstance,
  ) => {
    return fastify.prisma.post.create({
      data: args.dto,
    });
  };

  static updateResolver = async (
    _parent,
    args: IUpdatePostArgs,
    fastify: FastifyInstance,
  ) => {
    return fastify.prisma.post.update({
      where: { id: args.id },
      data: args.dto,
    });
  };

  static deleteResolver = async (
    _parent,
    args: IPostTypeArgs,
    fastify: FastifyInstance,
  ) => {
    await fastify.prisma.post.delete({
      where: {
        id: args.id,
      },
    });
  };
}

// Fields
const postField = {
  type: Post.type,
  args: Post.argsGet,
  resolve: Post.getResolver,
};

const manyPostsField = {
  type: Post.arrayType,
  resolve: Post.getManyResolver,
};

const createPostField = {
  type: Post.type,
  args: {
    dto: {
      type: new GraphQLNonNull(Post.argsCreate),
    },
  },
  resolve: Post.createResolver,
};

const changePostField = {
  type: Post.type,
  args: {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    dto: {
      type: new GraphQLNonNull(Post.argsUpdate),
    },
  },
  resolve: Post.updateResolver,
};

const deletePostField = {
  type: GraphQLBoolean,
  args: {
    id: { type: UUIDType },
  },
  resolve: Post.deleteResolver,
};

export {
  postField,
  manyPostsField,
  createPostField,
  changePostField,
  deletePostField,
  Post,
};
