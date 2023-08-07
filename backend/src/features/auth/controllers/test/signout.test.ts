import { Request, Response } from 'express';
import { Signout } from '~auth/controllers/singout';
import { authMockRequest, authMockResponse } from '~mocks/auth.mock';

describe('Signout', () => {
  it('Should works normally', () => {
    const req: Request = authMockRequest({}, {}) as Request;

    const res: Response = authMockResponse();

    Signout.prototype.signout(req, res);

    expect(req.session).toBe(null);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Successful logout', user: {}, token: '' });
  });
});
