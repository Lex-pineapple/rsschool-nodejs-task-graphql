import DataLoader from 'dataloader';
import { FastifyInstance } from 'fastify';
import { IProfile } from './types/profileTypes.js';
import { IPost } from './types/postTypes.js';
import { IMemberTypeResolve } from './types/memberTypeType.js';
import { IUser } from './types/userTypes.js';

export interface IDataloaders {
  usersLoader: DataLoader<string, IUser, string>;
  profilesLoader: DataLoader<string, IProfile, string>;
  postsLoader: DataLoader<string, IPost, string>;
  memberTypeLoader: DataLoader<string, IMemberTypeResolve, string>;
  subscribedToUserLoader: DataLoader<string, IUser[], string>;
  userSubscribedToLoader: DataLoader<string, IUser[], string>;
}

export interface IGraphqlContext {
  fastify: FastifyInstance;
  dataloaders: IDataloaders;
}

const createDataloaders = (fastify: FastifyInstance) => {
  const usersLoader = new DataLoader(async (ids: readonly string[]) => {
    const result = ids.map(async (id) => {
      return await fastify.prisma.user.findMany({
        where: { id },
      });
    });
    return result;
  });
  const profilesLoader = new DataLoader(async (ids: readonly string[]) => {
    const result = ids.map(async (id) => {
      const profile = await fastify.prisma.profile.findMany({
        where: { userId: id },
      });
      return profile[0];
    });

    return result;
  });

  const postsLoader = new DataLoader(async (ids: readonly string[]) => {
    const result = ids.map(async (id) => {
      return await fastify.prisma.post.findMany({
        where: { authorId: id },
      });
    });
    return result;
  });

  const memberTypeLoader = new DataLoader(async (ids: readonly string[]) => {
    const result = ids.map(async (id) => {
      const memberType = await fastify.prisma.memberType.findMany({
        where: { id },
      });
      return memberType[0];
    });
    return result;
  });

  const subscribedToUserLoader = new DataLoader(async (ids: readonly string[]) => {
    const result = ids.map(async (id) => {
      return await fastify.prisma.user.findMany({
        where: {
          userSubscribedTo: {
            some: {
              authorId: id,
            },
          },
        },
      });
    });
    return result;
  });

  const userSubscribedToLoader = new DataLoader(async (ids: readonly string[]) => {
    const result = ids.map(async (id) => {
      return fastify.prisma.user.findMany({
        where: {
          subscribedToUser: {
            some: {
              subscriberId: id,
            },
          },
        },
      });
    });
    return result;
  });

  return {
    usersLoader,
    profilesLoader,
    postsLoader,
    memberTypeLoader,
    subscribedToUserLoader,
    userSubscribedToLoader,
  };
};

export { createDataloaders };
