import { GraphQLEnumType } from 'graphql';

const memberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: {
      value: 'basic',
    },
    BUSINESS: {
      value: 'business',
    },
  },
});

export { memberTypeId };
