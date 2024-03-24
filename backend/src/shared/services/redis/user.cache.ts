import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
import { INotificationSettings, ISocialLinks, IUserDocument } from '~user/interfaces/user.interface';
import { BaseCache } from './base.cache';
import { config } from '~/config';
import Logger from 'bunyan';
import { ServerError } from '~global/helpers/error-handler';
import { Helpers } from '~global/helpers/helpers';
import { isEmpty } from 'lodash';

const log: Logger = config.createLogger('userCache');
type IUserItem = string | ISocialLinks | INotificationSettings;
type IUserMultiType = string | string[] | Buffer | RedisCommandRawReply[] | IUserDocument | IUserDocument[];

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument) {
    const {
      _id,
      authId,
      username,
      email,
      avatarColor,
      uId,
      postsCount,
      work,
      school,
      quote,
      location,
      blocked,
      blockedBy,
      followersCount,
      followingCount,
      notifications,
      social,
      bgImageVersion,
      bgImageId,
      profilePicture
    } = createdUser;
    const createdAt = new Date();

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'authId',
      `${authId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'uId',
      `${uId}`,
      'postsCount',
      `${postsCount}`,
      'work',
      `${work}`,
      'school',
      `${school}`
    ];

    const secondList: string[] = [
      'quote',
      `${quote}`,
      'location',
      `${location}`,
      'blocked',
      JSON.stringify(blocked),
      'blockedBy',
      JSON.stringify(blockedBy),
      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`,
      'notifications',
      JSON.stringify(notifications),
      'social',
      JSON.stringify(social)
    ];

    const thirdList: string[] = [
      'bgImageVersion',
      `${bgImageVersion}`,
      'bgImageId',
      `${bgImageId}`,
      'profilePicture',
      `${profilePicture}`,
      'createdAt',
      JSON.stringify(createdAt)
    ];

    const dataToSave: string[] = [...firstList, ...secondList, ...thirdList];
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('users', { score: parseInt(userUId, 10), value: `${key}` });
      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, please try again');
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
      response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
      response.postsCount = Helpers.parseJson(response.postsCount);
      response.work = Helpers.parseJson(`${response.work}`);
      response.school = Helpers.parseJson(`${response.school}`);
      response.quote = Helpers.parseJson(`${response.quote}`);
      response.location = Helpers.parseJson(`${response.location}`);
      response.blocked = Helpers.parseJson(`${response.blocked}`);
      response.blockedBy = Helpers.parseJson(`${response.blockedBy}`);
      response.followersCount = Helpers.parseJson(response.followersCount);
      response.social = Helpers.parseJson(`${response.social}`);
      response.notifications = Helpers.parseJson(`${response.notifications}`);
      response.followingCount = Helpers.parseJson(response.followingCount);
      response.bgImageVersion = Helpers.parseJson(`${response.bgImageVersion}`);
      response.bgImageId = Helpers.parseJson(`${response.bgImageId}`);
      response.profilePicture = Helpers.parseJson(`${response.profilePicture}`);

      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, please try again');
    }
  }

  public async updateSingleFieldInCache(userId: string, field: string, value: IUserItem): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      await this.client.HSET(`users:${userId}`, field, JSON.stringify(value));
      const user: IUserDocument = Helpers.parseJson(await this.client.HGETALL(`users:${userId}`));
      return isEmpty(user) ? null : user;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, please try again');
    }
  }

  public async getUsersFromCache(start: number, end: number, excludeUserKey: string): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const response: string[] = await this.client.ZRANGE('users', start, end);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const key of response) {
        if (key !== excludeUserKey) multi.HGETALL(`users:${key}`);
      }
      let replies: IUserMultiType = (await multi.exec()) as IUserMultiType;
      // Since typescript doesn't know what type of replies currently is
      replies = replies as IUserDocument[];

      const userReplies: IUserDocument[] = [];
      for (let i = start; i < end && i < replies.length; i++) {
        const reply = replies[i] as IUserDocument;

        reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`));
        reply.postsCount = Helpers.parseJson(reply.postsCount);
        reply.work = Helpers.parseJson(`${reply.work}`);
        reply.school = Helpers.parseJson(`${reply.school}`);
        reply.quote = Helpers.parseJson(`${reply.quote}`);
        reply.location = Helpers.parseJson(`${reply.location}`);
        reply.blocked = Helpers.parseJson(`${reply.blocked}`);
        reply.blockedBy = Helpers.parseJson(`${reply.blockedBy}`);
        reply.followersCount = Helpers.parseJson(reply.followersCount);
        reply.social = Helpers.parseJson(`${reply.social}`);
        reply.notifications = Helpers.parseJson(`${reply.notifications}`);
        reply.followingCount = Helpers.parseJson(reply.followingCount);
        reply.bgImageVersion = Helpers.parseJson(`${reply.bgImageVersion}`);
        reply.bgImageId = Helpers.parseJson(`${reply.bgImageId}`);
        reply.profilePicture = Helpers.parseJson(`${reply.profilePicture}`);

        userReplies.push(reply);
      }

      return userReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, please try again');
    }
  }
  public async getRandomUsersFromCache(userId: string, excludeUserKey: string): Promise<IUserDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const replies: IUserDocument[] = [];
      const followers: string[] = await this.client.LRANGE(`followers:${userId}`, 0, -1);
      const usersKeys: string[] = await this.client.ZRANGE('users', 0, -1);

      for (const key of usersKeys) {
        // Exclude user
        if (key === excludeUserKey) continue;
        const foundIndex: number = followers.indexOf(key);
        if (foundIndex === -1) {
          const reply: IUserDocument = (await this.client.HGETALL(`users:${key}`)) as unknown as IUserDocument;

          reply.createdAt = new Date(Helpers.parseJson(`${reply.createdAt}`));
          reply.postsCount = Helpers.parseJson(reply.postsCount);
          reply.work = Helpers.parseJson(`${reply.work}`);
          reply.school = Helpers.parseJson(`${reply.school}`);
          reply.quote = Helpers.parseJson(`${reply.quote}`);
          reply.location = Helpers.parseJson(`${reply.location}`);
          reply.blocked = Helpers.parseJson(`${reply.blocked}`);
          reply.blockedBy = Helpers.parseJson(`${reply.blockedBy}`);
          reply.followersCount = Helpers.parseJson(reply.followersCount);
          reply.social = Helpers.parseJson(`${reply.social}`);
          reply.notifications = Helpers.parseJson(`${reply.notifications}`);
          reply.followingCount = Helpers.parseJson(reply.followingCount);
          reply.bgImageVersion = Helpers.parseJson(`${reply.bgImageVersion}`);
          reply.bgImageId = Helpers.parseJson(`${reply.bgImageId}`);
          reply.profilePicture = Helpers.parseJson(`${reply.profilePicture}`);
        }
      }

      return replies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, please try again');
    }
  }

  public async getTotalUsersInCache(): Promise<number> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const count: number = await this.client.ZCARD('users');
      return count;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, please try again');
    }
  }
}
