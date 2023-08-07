import { IUserDocument } from '~user/interfaces/user.interface';
import { BaseCache } from './base.cache';
import { config } from '~/config';
import Logger from 'bunyan';
import { ServerError } from '~global/helpers/error-handler';
import { Helpers } from '~global/helpers/helpers';

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
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
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
}
