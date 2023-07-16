import { FastifyInstance } from 'fastify';
import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
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
  id: string;
  title: string;
  content: string;
  authorId: string;
}

interface IUpdatePostArgs {
  id: string;
  title: string;
  content: string;
  authorId: string;
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

  static argsCreate = {
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  };

  static argsUpdate = {
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
  };

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
      data: args,
    });
  };

  static updateResolver = async (
    _parent,
    args: IUpdatePostArgs,
    fastify: FastifyInstance,
  ) => {
    const { id, ...body } = args;
    return fastify.prisma.post.update({
      where: { id: id },
      data: body,
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
  args: Post.argsCreate,
  resolve: Post.createResolver,
};

const updatePostField = {
  type: Post.type,
  args: Post.argsUpdate,
  resolve: Post.updateResolver,
};

const deletePostField = {
  type: Post.type,
  args: {
    id: { type: UUIDType },
  },
  resolve: Post.deleteResolver,
};

export {
  postField,
  manyPostsField,
  createPostField,
  updatePostField,
  deletePostField,
  Post,
};
