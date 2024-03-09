import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { followerQueue } from '~services/queues/follower.queue';
import { FollowerCache } from '~services/redis/follower.cache';

const followerCache: FollowerCache = new FollowerCache();

export class UnfollowUser {
  public async unfollow(req: Request, res: Response): Promise<void> {
    const { followeeId } = req.params;

    const removeFollower: Promise<void> = followerCache.removeFollowerFromCache(`followers:${followeeId}`, req.currentUser!.userId);
    const removeFollowee: Promise<void> = followerCache.removeFollowerFromCache(`followings:${req.currentUser!.userId}`, followeeId);

    const updateFollowingCount: Promise<void> = followerCache.updateFollowerCountInCache(req.currentUser!.userId, 'followingCount', -1);
    const updateFollwerCount: Promise<void> = followerCache.updateFollowerCountInCache(followeeId, 'followersCount', -1);

    await Promise.all([removeFollower, removeFollowee, updateFollowingCount, updateFollwerCount]);

    followerQueue.addFollowerJob('removeFollowerFromDB', {
      keyOne: req.currentUser!.userId,
      keyTwo: followeeId
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now' });
  }
}
