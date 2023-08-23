import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { FollowerCache } from '~services/redis/follower.cache';
import { IFollowerData } from '~follower/interfaces/follower.interface';
import { followerService } from '~services/db/follower.service';

const followerCache: FollowerCache = new FollowerCache();

export class GetFollower {
  public async followers(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    const followersFromCache: IFollowerData[] = await followerCache.getFollowersFromCache(`followers:${userId}`);

    const followers: IFollowerData[] = followersFromCache.length ? followersFromCache : await followerService.getFollowersFromDB(userId);

    res.status(HTTP_STATUS.OK).json({ message: 'Followers', followers });
  }

  public async followings(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;

    const followeesFromCache: IFollowerData[] = await followerCache.getFollowersFromCache(`followings:${userId}`);

    const followings: IFollowerData[] = followeesFromCache.length ? followeesFromCache : await followerService.getFollowingsFromDB(userId);

    res.status(HTTP_STATUS.OK).json({ message: 'Followings', followings });
  }
}
