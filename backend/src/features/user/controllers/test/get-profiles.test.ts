import HTTP_STATUS from 'http-status-codes';
import { Response, Request } from 'express';
import { UserCache } from '~services/redis/user.cache';
import { userService } from '~services/db/user.service';
import { FollowerCache } from '~services/redis/follower.cache';
import { followerService } from '~services/db/follower.service';
import { PostCache } from '~services/redis/post.cache';
import { GetUsers } from '../get-profiles';
import { userMock } from '~mocks/user.mock';
import { mockFollower } from '~mocks/follower.mock';
import { authUserPayload } from '~mocks/auth.mock';
import { BaseQueue } from '~services/queues/base.queue';

jest.mock('~services/queues/base.queue');
jest.mock;
jest.mock;
jest.mock;
jest.mock;

describe('get-profiles: GetUsers', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  // all
  describe('all', () => {
    it('should send successfully if users in cache', async () => {
      const req: Request = { params: { page: '1' }, currentUser: authUserPayload } as unknown as Request;
      const res: Response = {} as Response;
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      // Cache
      jest.spyOn(UserCache.prototype, 'getUsersFromCache').mockResolvedValue([userMock]);
      jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([mockFollower]);
      jest.spyOn(UserCache.prototype, 'getTotalUsersInCache').mockResolvedValue(2); // included the current user
      await GetUsers.prototype.all(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get users',
        users: [userMock],
        totalUsers: 1,
        followers: [mockFollower]
      });
    });

    it('should use data from db, if there is no user in cache', async () => {
      const req: Request = { params: { page: '1' }, currentUser: authUserPayload } as unknown as Request;
      const res: Response = {} as Response;
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      // Cache
      jest.spyOn(UserCache.prototype, 'getUsersFromCache').mockResolvedValue([]);
      jest.spyOn(FollowerCache.prototype, 'getFollowersFromCache').mockResolvedValue([]);
      jest.spyOn(UserCache.prototype, 'getTotalUsersInCache').mockResolvedValue(1); // included the current user
      // In db
      jest.spyOn(userService, 'getAllUsers').mockResolvedValue([userMock]);
      jest.spyOn(userService, 'getTotalUsers').mockResolvedValue(2); // included the current user
      jest.spyOn(followerService, 'getFollowersFromDB').mockResolvedValue([mockFollower]);

      await GetUsers.prototype.all(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Get users',
        users: [userMock],
        totalUsers: 1,
        followers: [mockFollower]
      });
    });
  });

  // profile
  describe('profile', () => {});

  // profileByUserId
  describe('profileByUserId', () => {});

  // profilesAndPosts
  describe('profilesAndPosts', () => {});

  // randomUsersSuggestion
  describe('randomUsersSuggestion', () => {});
});
