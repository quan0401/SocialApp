import { IPostDocument, ISavePostToCache } from '~post/interfaces/post.interface';

import { BaseCache } from '~services/redis/base.cache';

import { config } from '~/config';

import Logger from 'bunyan';

import { ServerError } from '~global/helpers/error-handler';

import { Helpers } from '~global/helpers/helpers';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';

const log: Logger = config.createLogger('postCache');

export type postCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IPostDocument | IPostDocument[];

export class PostCache extends BaseCache {
  constructor() {
    super('PostCache');
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data;

    const {
      _id,
      userId,
      username,
      email,
      avatarColor,
      profilePicture,
      post,
      bgColor,
      privacy,
      gifUrl,
      commentsCount,
      reactions,
      createdAt,
      imgId,
      imgVersion
    } = createdPost;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'profilePicture',
      `${profilePicture}`,
      'post',
      `${post}`,
      'imgId',
      `${imgId}`,
      'imgVersion',
      `${imgVersion}`,
      'bgColor',
      `${bgColor}`
    ];

    const secondList: string[] = [
      'privacy',
      `${privacy}`,
      'gifUrl',
      `${gifUrl}`,
      'commentsCount',
      `${commentsCount}`,
      'reactions',
      JSON.stringify(reactions),
      'createdAt',
      JSON.stringify(createdAt)
    ];

    const dataToSave = [...firstList, ...secondList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const postCounts: string[] = await this.client.HMGET(`user:${currentUserId}`, 'postsCount');

      // const result: string = (await this.client.HGET(`user:${currentUserId}`, 'postCounts')) as string;

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      multi.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });

      multi.HSET(`posts:${key}`, dataToSave);

      const postCountsInt: number = parseInt(postCounts[0], 10) + 1;

      multi.HSET(`users:${userId}`, ['postCounts', postCountsInt]);

      await multi.exec();
    } catch (error) {
      log.error(error);

      throw new ServerError('PostCache error, please try again');
    }
  }

  public async getPostsFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect();

      const postIds: string[] = await this.client.ZRANGE(key, start, end, { REV: true });

      const posts: IPostDocument[] = [];

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      postIds.forEach((postId) => {
        multi.HGETALL(`posts:${postId}`);
      });

      // const replies = (await multi.exec()) as unknown as IPostDocument[];
      const replies: postCacheMultiType = (await multi.exec()) as postCacheMultiType;

      for (const post of replies as IPostDocument[]) {
        post.commentsCount = Helpers.parseJson(post.commentsCount);

        post.reactions = Helpers.parseJson(post.reactions);

        post.createdAt = new Date(Helpers.parseJson(post.createdAt));

        posts.push(post);
      }

      return posts;
    } catch (error) {
      log.error(error);

      throw new ServerError('Post Cache error');
    }
  }

  public async getTotalPostCountInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const counts: number = await this.client.ZCARD('post');
      return counts;
    } catch (error) {
      log.error(error);
      throw new ServerError('Post cache error');
    }
  }

  public async getPostsWithImagesFromCache(key: string, start: number, end: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect();

      const postIds: string[] = await this.client.ZRANGE(key, start, end, { REV: true });

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      postIds.forEach((postId) => {
        multi.HGETALL(`posts:${postId}`);
      });

      // const replies = (await multi.exec()) as unknown as IPostDocument[];
      const replies: postCacheMultiType = (await multi.exec()) as postCacheMultiType;
      const postsWithImages: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          post.commentsCount = Helpers.parseJson(post.commentsCount);

          post.reactions = Helpers.parseJson(post.reactions);

          post.createdAt = new Date(Helpers.parseJson(post.createdAt));

          postsWithImages.push(post);
        }
      }

      return postsWithImages;
    } catch (error) {
      log.error(error);

      throw new ServerError('Post Cache error');
    }
  }

  public async getUserPostsFromCache(key: string, uId: number): Promise<IPostDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect();

      const postIds: string[] = await this.client.ZRANGE(key, uId, uId, { REV: true, BY: 'SCORE' });

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      postIds.forEach((postId) => {
        multi.HGETALL(`posts:${postId}`);
      });

      // const replies = (await multi.exec()) as unknown as IPostDocument[];
      const replies: postCacheMultiType = (await multi.exec()) as postCacheMultiType;
      const posts: IPostDocument[] = [];
      for (const post of replies as IPostDocument[]) {
        if ((post.imgId && post.imgVersion) || post.gifUrl) {
          post.commentsCount = Helpers.parseJson(post.commentsCount);

          post.reactions = Helpers.parseJson(post.reactions);

          post.createdAt = new Date(Helpers.parseJson(post.createdAt));

          posts.push(post);
        }
      }

      return posts;
    } catch (error) {
      log.error(error);

      throw new ServerError('Post Cache error');
    }
  }

  public async getTotalUserPostCountInCache(uId: number): Promise<number> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const counts: number = await this.client.ZCOUNT('post', uId, uId);
      return counts;
    } catch (error) {
      log.error(error);
      throw new ServerError('Post cache error');
    }
  }

  public async deletePostFromCache(key: string, currentUser: string): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect();

      const postsCount: string[] = await this.client.HMGET(`user:${currentUser}`, 'postCounts');

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZREM(key, `${key}`);
      multi.DEL(`posts:${key}`);
      multi.DEL(`comments:${key}`);
      multi.DEL(`reactions:${key}`);
      multi.HSET(`users:${key}`, 'postCounts', `${parseInt(postsCount[0], 10) - 1}`);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Post Cache error');
    }
  }

  public async updatePostInCache(key: string, data: IPostDocument): Promise<IPostDocument> {
    try {
      const { profilePicture, post, bgColor, image, imgVersion, imgId, feelings, gifUrl, privacy } = data;

      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const dataToSave = {
        profilePicture: `${profilePicture}`,
        post: `${post}`,
        imgId: `${imgId}`,
        imgVersion: `${imgVersion}`,
        bgColor: `${bgColor}`,
        privacy: `${privacy}`,
        gifUrl: `${gifUrl}`,
        // image: `${image}`,
        feelings: JSON.stringify(feelings)
      };

      const multi: ReturnType<typeof this.client.multi> = this.client.multi();

      for (const [dataKey, value] of Object.entries(dataToSave)) {
        multi.HSET(`posts:${key}`, dataKey!, value!);
      }
      await multi.exec();

      const postInCache = (await this.client.HGETALL(`posts:${key}`)) as unknown as IPostDocument;

      postInCache.commentsCount = Helpers.parseJson(postInCache.commentsCount);
      postInCache.reactions = Helpers.parseJson(postInCache.reactions);
      postInCache.createdAt = new Date(Helpers.parseJson(postInCache.createdAt));
      return postInCache;
    } catch (error) {
      log.error(error);
      throw new ServerError('Post Cache error');
    }
  }
}
