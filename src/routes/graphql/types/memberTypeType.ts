import { FastifyInstance } from 'fastify';
import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { memberTypeId } from './memberTypeId.js';
import { IProfileType, Profile } from './profileTypes.js';

export interface IMemberType {
  id: string;
  discount: number;
  postsLimitPerMonth: number;
  profiles: IProfileType[];
}

export interface IMemberTypeArgs {
  id: string;
}

class MemberType {
  // Types
  static type: GraphQLObjectType = new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
      id: {
        type: memberTypeId,
      },
      discount: {
        type: GraphQLFloat,
      },
      postsLimitPerMonth: {
        type: GraphQLInt,
      },
      profiles: {
        type: new GraphQLList(Profile.type),
        resolve: Profile.profileFromMemberTypeResolver,
      },
    }),
  });

  static arrayType = new GraphQLNonNull(
    new GraphQLList(new GraphQLNonNull(MemberType.type)),
  );

  // Args
  static argsGet = {
    id: { type: memberTypeId },
  };

  // Resolver
  static getResolver = async (
    _parent,
    args: IMemberTypeArgs,
    fastify: FastifyInstance,
  ) => {
    const memberType = await fastify.prisma.memberType.findUnique({
      where: {
        id: args.id,
      },
    });
    return memberType;
  };

  static memberTypeFromProfileResolver = async (
    parent: IProfileType,
    _args,
    fastify: FastifyInstance,
  ) => {
    const memberType = await fastify.prisma.memberType.findUnique({
      where: {
        id: parent.memberTypeId,
      },
    });
    return memberType;
  };

  static getManyResolver = async (_parent, _args, fastify: FastifyInstance) => {
    return fastify.prisma.memberType.findMany();
  };
}

// Fields
const memberTypeField = {
  type: MemberType.type,
  args: MemberType.argsGet,
  resolve: MemberType.getResolver,
};

const manyMemberTypesField = {
  type: MemberType.arrayType,
  resolve: MemberType.getManyResolver,
};

export { memberTypeField, manyMemberTypesField, MemberType };
