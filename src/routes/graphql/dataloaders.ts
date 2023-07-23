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
}

export interface IGraphqlContext {
  fastify: FastifyInstance;
  dataloaders?: IDataloaders;
}

const createDataloaders = (fastify: FastifyInstance) => {
  const profilesLoader = new DataLoader(async (ids: readonly string[]) => {
    const results = await fastify.prisma.profile.findMany({
      where: { userId: { in: ids as string[] } },
    });

    return ids.map((id) => {
      let item: IProfile | null = null;
      results.forEach((res) => res.userId == id && (item = res));
      return item;
    });
  });

  const postsLoader = new DataLoader(async (ids: readonly string[]) => {
    const results = await fastify.prisma.post.findMany({
      where: { authorId: { in: ids as string[] } },
    });
    return ids.map((id) => {
      const arr: IPost[] = [];
      results.forEach((res) => res.authorId == id && arr.push(res));
      return arr;
    });
  });

  const memberTypeLoader = new DataLoader(async (ids: readonly string[]) => {
    const results = await fastify.prisma.memberType.findMany({
      where: { id: { in: ids as string[] } },
    });

    return ids.map((id) => {
      let item: IMemberTypeResolve | null = null;
      results.forEach((res) => res.id === id && (item = res));
      return item;
    });
  });

  const usersLoader = new DataLoader(async (ids: readonly string[]) => {
    const results = await fastify.prisma.user.findMany({
      where: { id: { in: ids as string[] } },
      include: {
        userSubscribedTo: true,
        subscribedToUser: true,
      },
    });
    return ids.map((id) => {
      let item: IUser | null = null;
      results.forEach((res) => res.id === id && (item = res));
      return item;
    });
  });

  return {
    profilesLoader,
    postsLoader,
    memberTypeLoader,
    usersLoader,
  };
};

export { createDataloaders };
