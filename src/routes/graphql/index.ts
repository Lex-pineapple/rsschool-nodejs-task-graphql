import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import schema from './schema/graphQLSchema.js';
import depthLimit from 'graphql-depth-limit';
import { createDataloaders } from './dataloaders.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const dataloaders = createDataloaders(fastify);
      const validationError = validate(schema, parse(req.body.query), [depthLimit(5)]);
      if (validationError.length > 0) return { errors: validationError };
      return await graphql({
        schema,
        source: String(req.body.query),
        contextValue: { fastify, dataloaders },
        variableValues: req.body.variables,
      });
    },
  });
};

export default plugin;
