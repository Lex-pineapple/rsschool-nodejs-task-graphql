import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponse, gqlResponse } from './schemas.js';
import { graphql } from 'graphql';
import schema from './schema/query/querySchema.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponse,
      response: {
        200: gqlResponse,
      },
    },
    async handler(req) {
      return await graphql({
        schema,
        source: String(req.body.query),
        contextValue: fastify,
        variableValues: req.body.variables,
      });
    },
  });
};

export default plugin;
