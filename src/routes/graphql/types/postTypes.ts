import { FastifyInstance } from 'fastify';
import {
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

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

// Types
const postType = new GraphQLObjectType({
  name: 'Post',
  fields: {
    id: {
      // TODO: Figure out uuid type
      type: GraphQLString,
    },
    title: {
      type: GraphQLString,
    },
    content: {
      type: GraphQLString,
    },
    authorId: {
      type: GraphQLID,
    },
  },
});

const manyPostsType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(postType)));

// Args
const postTypeArgs = {
  id: { type: GraphQLString },
};

const createPostArgs = {
  id: {
    // TODO: Figure out uuid type
    type: new GraphQLNonNull(GraphQLString),
  },
  title: {
    type: new GraphQLNonNull(GraphQLString),
  },
  content: {
    type: new GraphQLNonNull(GraphQLString),
  },
  authorId: {
    type: new GraphQLNonNull(GraphQLID),
  },
};

const updatePostArgs = {
  id: {
    // TODO: Figure out uuid type
    type: GraphQLString,
  },
  title: {
    type: GraphQLString,
  },
  content: {
    type: GraphQLString,
  },
  authorId: {
    type: GraphQLID,
  },
};

// Resolvers
const postResolver = async (_parent, args: IPostTypeArgs, fastify: FastifyInstance) => {
  const post = await fastify.prisma.post.findUnique({
    where: {
      id: args.id,
    },
  });
  if (post === null) {
    throw fastify.httpErrors.notFound();
  }
  return post;
};

const manyPostsResolver = async (_parent, _args, fastify: FastifyInstance) => {
  return fastify.prisma.post.findMany();
};

const createPostResolve = async (
  _parent,
  args: ICreatePostArgs,
  fastify: FastifyInstance,
) => {
  return fastify.prisma.post.create({
    data: args,
  });
};

const updatePostResolve = async (
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

const deletePostResolve = async (
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

// Fields
const postField = {
  type: postType,
  args: postTypeArgs,
  resolve: postResolver,
};

const manyPostsField = {
  type: manyPostsType,
  resolve: manyPostsResolver,
};

const createPostField = {
  type: postType,
  args: createPostArgs,
  resolve: createPostResolve,
};

const updatePostField = {
  type: postType,
  args: updatePostArgs,
  resolve: updatePostResolve,
};

const deletePostField = {
  type: postType,
  args: {
    id: { type: GraphQLID },
  },
  resolve: deletePostResolve,
};

export { postField, manyPostsField, createPostField, updatePostField, deletePostField };
