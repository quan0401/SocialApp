import { Request, Response } from 'express';
import { FollowerCache } from '~services/redis/follower.cache';
import { followerQueue } from '~services/queues/follower.queue';
import { mockFollowerRequest, mockFollowerResponse } from '~mocks/follower.mock';
import { authUserPayload } from '~mocks/auth.mock';
import { AddFollower } from '~follower/controllers/add-follower';
import { UserCache } from '~services/redis/user.cache';

import { Server } from 'socket.io';

import * as followerServer from '~sockets/follower.socket';
import { userMock } from '~mocks/user.mock';

jest.mock('~services/redis/follower.cache');
jest.mock('~services/queues/follower.queue');
jest.mock('~services/queues/base.queue');
jest.mock('~services/redis/user.cache');

jest.useFakeTimers();

Object.defineProperties(followerServer, {
  socketIOFollowerObject: {
    value: new Server(),
    writable: true
  }
});

const FOLLOWEEID = '64db2ff1743a567d7e3f7823';

describe('Add-follower', () => {
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

    jest.spyOn(FollowerCache.prototype, 'updateFollowerCountInCache');
    jest.spyOn(FollowerCache.prototype, 'saveFollowerToCache');
    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(userMock);

    const spy = jest.spyOn(followerQueue, 'addFollowerJob');
    jest.spyOn(followerServer.socketIOFollowerObject, 'emit');

    await AddFollower.prototype.addFollower(req, res);

    expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledWith(FOLLOWEEID, 'followersCount', 1);
    expect(FollowerCache.prototype.updateFollowerCountInCache).toHaveBeenCalledWith(req.currentUser!.userId, 'followingCount', 1);

    expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledWith(`followings:${req.currentUser!.userId}`, FOLLOWEEID);
    expect(FollowerCache.prototype.saveFollowerToCache).toHaveBeenCalledWith(`followers:${FOLLOWEEID}`, req.currentUser!.userId);

    expect(UserCache.prototype.getUserFromCache).toHaveBeenCalledWith(FOLLOWEEID);
    expect(UserCache.prototype.getUserFromCache).toHaveBeenCalledWith(req.currentUser!.userId);

    expect(followerQueue.addFollowerJob).toHaveBeenCalledWith('addFollowerToDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${FOLLOWEEID}`,
      username: req.currentUser!.username,
      followerDocumentId: spy.mock.calls[0][1].followerDocumentId
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Following user now' });
  });
});
