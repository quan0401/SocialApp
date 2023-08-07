import { Password } from '~auth/controllers/password';
import { authService } from '~services/db/auth.service';
import { authMock, authMockRequest, authMockResponse } from '~mocks/auth.mock';
import { Request, Response } from 'express';
import { CustomError } from '~global/helpers/error-handler';
import { emailQueue } from '~services/queues/email.queue';

jest.mock('~services/queues/email.queue');
jest.mock('~services/queues/base.queue');
jest.mock('~services/db/auth.service');

describe('Password create', () => {
  it('Should throw error if email is not correct', () => {
    const req: Request = authMockRequest(
      {},
      {
        email: 'dongminhquan2004@gmail.com'
      }
    ) as Request;

    const res: Response = authMockResponse();

    Password.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('Should throw error if user is not exist', () => {
    const req: Request = authMockRequest(
      {},
      {
        email: 'dongminhquan2004@gmail.com'
      }
    ) as Request;

    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(null as any);

    Password.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('Should send json with successful message if everything is ok', async () => {
    const req: Request = authMockRequest(
      {},
      {
        email: 'dongminhquan2004@gmail.com'
      }
    ) as Request;

    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(authMock);
    jest.spyOn(emailQueue, 'addEmailJob');

    await Password.prototype.create(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(emailQueue.addEmailJob).toHaveBeenCalled();
    expect(res.json).toHaveBeenLastCalledWith({ message: 'Password reset email sent' });
  });
});

describe('Password update', () => {
  it('Should throw error if password and confirmPassword not match', () => {
    const req: Request = authMockRequest(
      {},
      {
        password: 'quan0401',
        confirmPassword: 'quan1234'
      },
      null,
      { token: 'qw2er' }
    ) as Request;

    const res: Response = authMockResponse();

    Password.prototype.update(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Passwords should match');
    });
  });
  it('Should throw error if token not exist', () => {
    const req: Request = authMockRequest(
      {},
      {
        password: 'quan0401',
        confirmPassword: 'quan0401'
      },
      null,
      { token: '1234' }
    ) as Request;

    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getAuthUserByPasswordToken').mockResolvedValue(null as any);

    Password.prototype.update(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Reset token has expired');
    });
  });

  it('Should work normally', async () => {
    const req: Request = authMockRequest(
      {},
      {
        password: 'quan0401',
        confirmPassword: 'quan0401'
      },
      null,
      { token: '1234' }
    ) as Request;

    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getAuthUserByPasswordToken').mockResolvedValue(authMock);
    jest.spyOn(emailQueue, 'addEmailJob');
    await Password.prototype.update(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Password successfully updated.'
    });
  });
});
