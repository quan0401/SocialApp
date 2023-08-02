import { IUserDocument } from '~user/interfaces/user.interface';
import { BaseCache } from './base.cache';
import { config } from '~/config';
import Logger from 'bunyan';
import { ServerError } from '~global/helpers/error-handler';

const log: Logger = config.createLogger('userCache');

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
      password,
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
      'password',
      `${password}`,
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
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error, please try again');
    }
  }
}
