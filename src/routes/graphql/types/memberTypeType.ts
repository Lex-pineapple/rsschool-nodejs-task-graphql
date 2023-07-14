import { FastifyInstance } from 'fastify';
import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const memberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: {
      type: GraphQLString,
    },
    discount: {
      type: GraphQLInt,
    },
    postsLimitPerMonth: {
      type: GraphQLInt,
    },
  },
});

const memberTypeArgs = {
  id: { type: GraphQLString },
};

export interface IMemberTypeArgs {
  id: string;
}

const memberTypeResolver = async (
  _parent,
  args: IMemberTypeArgs,
  fastify: FastifyInstance,
) => {
  const memberType = await fastify.prisma.memberType.findUnique({
    where: {
      id: args.id,
    },
  });
  if (memberType === null) {
    throw fastify.httpErrors.notFound();
  }
  return memberType;
};

const manyMemberTypes = new GraphQLNonNull(
  new GraphQLList(new GraphQLNonNull(memberType)),
);

const manyMemberTypesResolver = async (_parent, _args, fastify: FastifyInstance) => {
  return fastify.prisma.memberType.findMany();
};

const memberTypeField = {
  type: memberType,
  args: memberTypeArgs,
  resolve: memberTypeResolver,
};

const manyMemberTypesField = {
  type: manyMemberTypes,
  resolve: manyMemberTypesResolver,
};

export { memberTypeField, manyMemberTypesField };
