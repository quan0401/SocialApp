import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { IFollowerData } from '~follower/interfaces/follower.interface';
import { FollowerCache } from '~services/redis/follower.cache';
import { Request, Response } from 'express';
import { UserCache } from '~services/redis/user.cache';
import { IUserDocument } from '~user/interfaces/user.interface';
import { socketIOFollowerObject } from '~sockets/follower.socket';
import { followerQueue } from '~services/queues/follower.queue';

const followerCache: FollowerCache = new FollowerCache();
const userCache: UserCache = new UserCache();

export class AddFollower {
  public async addFollower(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params;

    const followerCount: Promise<void> = followerCache.updateFollowerCountInCache(followeeId, 'followersCount', 1);
    const followeeCount: Promise<void> = followerCache.updateFollowerCountInCache(req.currentUser!.userId, 'followingCount', 1);

    const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(`followings:${req.currentUser!.userId}`, followeeId);
    const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToCache(`followers:${followeeId}`, req.currentUser!.userId);

    await Promise.all([followerCount, followeeCount, addFollowerToCache, addFolloweeToCache]);

    const cacheFollowee: Promise<IUserDocument> = userCache.getUserFromCache(followeeId) as Promise<IUserDocument>;
    const cacheFollower: Promise<IUserDocument> = userCache.getUserFromCache(req.currentUser!.userId) as Promise<IUserDocument>;

    const response: [IUserDocument, IUserDocument] = await Promise.all([cacheFollowee, cacheFollower]);

    const followeeData: IFollowerData = AddFollower.prototype.userData(response[0]);
    socketIOFollowerObject.emit('add follower', followeeData);

    const followerDocumentId: ObjectId = new ObjectId();

    followerQueue.addFollowerJob('addFollowerToDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${followeeId}`,
      username: req.currentUser!.username,
      followerDocumentId
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Following user now' });
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      avatarColor: user.avatarColor as string,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      postsCount: user.postsCount,
      username: user.username as string,
      uId: user.uId as string
    };
  }
}
