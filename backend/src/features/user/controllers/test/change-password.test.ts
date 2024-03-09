import HTTP_STATUS from 'http-status-codes';
import { AuthPayload } from '~auth/interfaces/auth.interface';
import { authMock, authMockRequest, authUserPayload } from '~mocks/auth.mock';
import { Update } from '~user/controllers/change-password';
import { Request, Response } from 'express';
import { CustomError } from '~global/helpers/error-handler';
import { authService } from '~services/db/auth.service';

jest.mock('~services/queues/base.queue');
jest.mock('~services/queues/email.queue');
jest.mock('~services/db/auth.service');

describe('ChangePassword', () => {
  beforeEach(() => {
    // Restore the spy created on spyOn
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('update', () => {
    it('Should throw error if newPassword and confirmPassword not match.', () => {
      const req: Request = authMockRequest(
        { jwt: '' },
        {
          currentPassword: 'quan040104',
          newPassword: 'quan0401',
          confirmPassword: 'quan04010'
        },
        {
          userId: authUserPayload.userId
        } as AuthPayload
      ) as unknown as Request;
      const res: Response = {} as Response;
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);

      Update.prototype.password(req, res).catch((error: CustomError) => {
        expect(error.serializeErrors().message).toEqual('Confirm password does not match new password.');
      });
    });

    it('Should throw error if any field is empty.', () => {
      const req: Request = {
        body: {
          currentPassword: 'quan040104',
          newPassword: '',
          confirmPassword: 'quan040104'
        }
      } as Request;
      const res: Response = {
        status: jest.fn().mockReturnValue(this) as unknown,
        json: jest.fn().mockReturnValue(this) as unknown
      } as Response;

      Update.prototype.password(req, res).catch((error: CustomError) => {
        expect(error.serializeErrors().message).toEqual('Password is a required field');
      });
    });

    it('Should throw error if the currentPassword and password is not match', async () => {
      const req: Request = {
        body: {
          currentPassword: 'quan0401',
          newPassword: 'quan040104',
          confirmPassword: 'quan040104'
        },
        currentUser: {
          email: authMock.email
        } as AuthPayload
      } as Request;
      const res: Response = {} as Response;
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);

      const spy = jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(authMock);

      await Update.prototype.password(req, res).catch((error: CustomError) => {
        expect(error.serializeErrors().message).toBe('Invalid credentials.');
        expect(error.statusCode).toBe(400);
      });
    });

    it('Should work normally', async () => {
      const req: Request = {
        body: {
          currentPassword: 'quan0401',
          newPassword: 'quan040104',
          confirmPassword: 'quan040104'
        },
        currentUser: {
          email: authMock.email
        } as AuthPayload
      } as Request;
      const res: Response = {} as Response;
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      // Correct password
      authMock.comparePassword = async () => true;

      const spy_getAuthUserByEmail = jest.spyOn(authService, 'getAuthUserByEmail').mockResolvedValue(authMock);
      const spy_findAndUpdatePasswordByEmail = jest.spyOn(authService, 'findAndUpdatePasswordByEmail');

      await Update.prototype.password(req, res);
      expect(authService.findAndUpdatePasswordByEmail).toHaveBeenCalledWith(
        req.currentUser!.email,
        authMock.hashPassword(req.body.newPassword)
      );
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Update password successfully. You will be redirected to login page shortly.'
      });
    });
  });
});
