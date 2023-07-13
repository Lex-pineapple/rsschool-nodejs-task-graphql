import { FastifyInstance } from "fastify";
import { GraphQLBoolean, GraphQLID, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLScalarType, GraphQLString } from "graphql";

const profileType = new GraphQLObjectType({
    name: 'Profile',
    fields: {
        id: {
            // TODO: Figure out uuid type
            type: GraphQLString,
        },
        isMale: {
            type: GraphQLBoolean,
        },
        yearOfBirth: {
            type: new GraphQLScalarType(GraphQLInt),
        },
        userId: {
            // TODO: Check later
            type: GraphQLID
        },
        memberTypeId: {
            // TODO: Check later
            type: GraphQLID
        }
    }
});

const profileTypeArgs = {
    id: {
        type: GraphQLString
    }
}

interface IProfileTypeArgs {
    id: string,
}

const profileResolver = async (_parent, args: IProfileTypeArgs, fastify: FastifyInstance) => {
    const profile = await fastify.prisma.profile.findUnique({
      where: {
        id: args.id,
      },
    });
    if (profile === null) {
      throw fastify.httpErrors.notFound();
    }
    return profile;
}

const manyProfilesType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(profileType)));

const manyProfilesResolver = async (_parent, _args, fastify: FastifyInstance) => {
    return fastify.prisma.profile.findMany();
}

const profileField = {
    type: profileType,
    args: profileTypeArgs,
    resolve: profileResolver,
}

const manyProfilesField = {
    type: manyProfilesType, 
    resolve: manyProfilesResolver,
}

export { profileField, manyProfilesField }