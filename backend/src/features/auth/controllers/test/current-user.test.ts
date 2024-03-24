import { Request, Response } from 'express';
import { AuthPayload } from '~auth/interfaces/auth.interface';
import { authMockRequest, authMockResponse } from '~mocks/auth.mock';
import { userMock } from '~mocks/user.mock';
import { userService } from '~services/db/user.service';
import { UserCache } from '~services/redis/user.cache';

import { CurrentUser } from '~auth/controllers/current-user';
jest.mock('~services/queues/base.queue');

describe('Current-user', () => {
  it('Should send null if user not exist', async () => {
    const req: Request = authMockRequest({}, {}, { userId: '123434' } as AuthPayload) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(null);
    jest.spyOn(userService, 'getUserById').mockResolvedValue(null as any);

    await CurrentUser.prototype.getCurrentUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      isUser: false,
      user: null,
      token: null
    });
  });

  it('Should works as expected', async () => {
    const req: Request = authMockRequest({ jwt: '1234' }, {}, { userId: '123434' } as AuthPayload) as Request;
    const res: Response = authMockResponse();
    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(null);
    jest.spyOn(userService, 'getUserById').mockResolvedValue(userMock);
    await CurrentUser.prototype.getCurrentUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      isUser: true,
      user: userMock,
      token: req.session?.jwt
    });
  });
});
