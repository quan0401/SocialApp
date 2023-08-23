import Logger from 'bunyan';
import { config } from '~/config';
import { BaseCache } from './base.cache';
import { ServerError } from '~global/helpers/error-handler';
import { IUserDocument } from '~user/interfaces/user.interface';
import { IFollowerData } from '~follower/interfaces/follower.interface';
import { Helpers } from '~global/helpers/helpers';
import mongoose from 'mongoose';

const log: Logger = config.createLogger('followerCache');

export class FollowerCache extends BaseCache {
  constructor() {
    super('followerCache');
  }
  public async saveFollowerToCache(key: string, userId: string): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      await this.client.LPUSH(`${key}`, JSON.stringify(userId));
    } catch (error) {
      log.error(error);
      throw new ServerError('followerCache error');
    }
  }

  public async removeFollowerFromCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      await this.client.LREM(`${key}`, 1, JSON.stringify(value));
    } catch (error) {
      log.error(error);
      throw new ServerError('followerCache error');
    }
  }

  public async updateFollowerCountInCache(userId: string, prop: string, count: number): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      await this.client.HINCRBY(`users:${userId}`, prop, count);
    } catch (error) {
      log.error(error);
      throw new ServerError('followerCache error');
    }
  }

  public async getFollowersFromCache(key: string): Promise<IFollowerData[]> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const ids: string[] = await this.client.LRANGE(key, 0, -1);
      const users: IFollowerData[] = [];

      for (let id of ids) {
        id = Helpers.parseJson(id);
        const user: IUserDocument = Helpers.parseJson(await this.client.HGETALL(`users:${id}`));

        if (!user?._id) {
          continue;
        }
        const data: IFollowerData = {
          avatarColor: user.avatarColor!,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          profilePicture: user.profilePicture,
          postsCount: user.postsCount,
          username: user.username!,
          uId: user.uId!,
          _id: new mongoose.Types.ObjectId(user._id),
          userProfile: user
        };
        users.push(data);
      }
      return users;
    } catch (error) {
      log.error(error);
      throw new ServerError('followerCache error');
    }
  }

  public async updateBlockInCache(userId: string, prop: string, value: string, type: 'block' | 'unblock'): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect();

      let blocked: string[] = Helpers.parseJson(await this.client.HMGET(`users:${userId}`, prop));
      if (type === 'block') {
        blocked.push(value);
        blocked = [...new Set(blocked)];
      } else if (type === 'unblock') {
        blocked = blocked.filter((id) => id !== value);
      }
      await this.client.HSET(`users:${userId}`, prop, JSON.stringify(blocked));
    } catch (error) {
      log.error(error);
      throw new ServerError('followerCache error');
    }
  }
}
