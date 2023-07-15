import { FastifyInstance } from 'fastify';
import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { memberTypeId } from './memberTypeId.js';

const memberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: {
    id: {
      type: memberTypeId,
    },
    discount: {
      type: GraphQLFloat,
    },
    postsLimitPerMonth: {
      type: GraphQLInt,
    },
  },
});

const memberTypeArgs = {
  id: { type: memberTypeId },
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

export { memberType, memberTypeField, manyMemberTypesField };
