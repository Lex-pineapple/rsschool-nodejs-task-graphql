import fastify, { FastifyInstance } from "fastify";
import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";

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
    }
});

const postTypeArgs = {
    id: { type: GraphQLString },
};

export interface IPostTypeArgs {
    id: string;
}

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
}

const manyPostsType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(postType)));

const manyPostsResolver = async (_parent, _args, fastify: FastifyInstance) => {
    return fastify.prisma.post.findMany();
}

const postField = {
    type: postType,
    args: postTypeArgs,
    resolve: postResolver,
}

const manyPostsField = {
    type: manyPostsType,
    resolve: manyPostsResolver,
}

export { postField, manyPostsField }