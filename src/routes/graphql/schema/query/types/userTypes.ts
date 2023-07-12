import { FastifyInstance } from 'fastify';
import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLString,
} from 'graphql';

export interface IUserTypeArgs {
  id: string;
}

const userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {
      // TODO: Figure out uuid type
      type: GraphQLString,
    },
    name: {
      type: GraphQLString,
    },
    balance: {
      type: new GraphQLScalarType(GraphQLFloat),
    },
  },
});

const userTypeArgs = {
  id: { type: GraphQLString },
};

const userResolver = async (_parent, args: IUserTypeArgs, fastify: FastifyInstance) => {
  const user = await fastify.prisma.user.findUnique({
    where: {
      id: args.id,
    },
  });
  if (user === null) {
    throw fastify.httpErrors.notFound();
  }
  return user;
};

const manyUsersType = new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType)));

const manyUsersResolver = async (_parent, _args, fastify: FastifyInstance) => {
  return fastify.prisma.user.findMany();
};

const userField = {
  type: userType,
  args: userTypeArgs,
  resolve: userResolver,
};

const manyUsersField = {
  type: manyUsersType,
  resolve: manyUsersResolver,
};

export { userField, manyUsersField };
