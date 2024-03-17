import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';

import { FollowerCache } from '~services/redis/follower.cache';
import { followerQueue } from '~services/queues/follower.queue';
import { mockFollowerRequest, mockFollowerResponse } from '~mocks/follower.mock';
import { authUserPayload } from '~mocks/auth.mock';
import { UnfollowUser } from '~follower/controllers/unfollow-user';

jest.mock('~services/redis/follower.cache');
jest.mock('~services/queues/follower.queue');
jest.mock('~services/queues/base.queue');

jest.useFakeTimers();

const FOLLOWEEID = '64db2ff1743a567d7e3f7823';

describe('Unfollow-user', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('Send correct response', async () => {
    const req: Request = mockFollowerRequest({ followeeId: FOLLOWEEID }, authUserPayload);
    const res: Response = mockFollowerResponse();

    jest.spyOn(FollowerCache.prototype, 'removeFollowerFromCache');
    jest.spyOn(FollowerCache.prototype, 'updateFollowerCountInCache');

    jest.spyOn(followerQueue, 'addFollowerJob');

    await UnfollowUser.prototype.unfollow(req, res);

    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledWith(`followers:${FOLLOWEEID}`, req.currentUser!.userId);
    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledWith(`followings:${req.currentUser!.userId}`, FOLLOWEEID);

    expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledWith(req.currentUser!.userId, 'followingCount', -1);
    expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledWith(FOLLOWEEID, 'followersCount', -1);

    expect(followerQueue.addFollowerJob).toHaveBeenCalledWith('removeFollowerFromDB', {
      keyOne: req.currentUser!.userId,
      keyTwo: FOLLOWEEID
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unfollowed user now' });
  });
});
