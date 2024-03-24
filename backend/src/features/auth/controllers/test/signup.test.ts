import { Request, Response } from 'express';
import { SignUp } from '~auth/controllers/signup';
import { IAuthDocument } from '~auth/interfaces/auth.interface';
import { CustomError } from '~global/helpers/error-handler';
import { authMock, authMockRequest, authMockResponse } from '~mocks/auth.mock';
import { authService } from '~services/db/auth.service';
import { UserCache } from '~services/redis/user.cache';
import * as cloudinaryUploads from '~global/helpers/cloudinary-upload';

// mock these because it related external connection
jest.useFakeTimers();
jest.mock('~services/queues/base.queue');
jest.mock('~services/queues/auth.queue');
jest.mock('~services/queues/user.queue');
jest.mock('~services/redis/user.cache');
jest.mock('~global/helpers/cloudinary-upload');

describe('SignUp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('Should throw error if username is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'dongminhquan2004@gmail.com',
        password: 'quan0401',
        avatarColor: 'red',
        avatarImage: 'https://res.cloudinary.com/vdg3fsapzu/image/upload/1690974751/social/64ca3a1d4e12ac4b6c7f766c.jpg'
      }
    ) as Request;

    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Username is a required field');
    });
  });

  it('Should throw error if username name length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'a',
        email: 'dongminhquan2004@gmail.com',
        password: 'quan0401',
        avatarColor: 'red',
        avatarImage: 'https://res.cloudinary.com/vdg3fsapzu/image/upload/1690974751/social/64ca3a1d4e12ac4b6c7f766c.jpg'
      }
    ) as Request;

    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Invalid username');
    });
  });

  it('Should throw error if password is missing', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'normal',
        email: 'dongminhquan2004@gmail.com',
        password: '',
        avatarColor: 'red',
        avatarImage: 'https://res.cloudinary.com/vdg3fsapzu/image/upload/1690974751/social/64ca3a1d4e12ac4b6c7f766c.jpg'
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Password is a required field');
    });
  });

  it('Should throw error if email is not valid', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'validus',
        email: 'invalidemail',
        password: 'quan0401',
        avatarColor: 'red',
        avatarImage: 'https://res.cloudinary.com/vdg3fsapzu/image/upload/1690974751/social/64ca3a1d4e12ac4b6c7f766c.jpg'
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Email must be valid');
    });
  });

  it('Should throw error if avatarColor is missing', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'validus',
        email: 'dongminhquan2004@gmail.com',
        password: 'quan0401',
        avatarImage: 'https://res.cloudinary.com/vdg3fsapzu/image/upload/1690974751/social/64ca3a1d4e12ac4b6c7f766c.jpg'
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Avatar color is required');
    });
  });

  it('Should throw error if avatarImage is missing', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'validus',
        email: 'dongminhquan2004@gmail.com',
        password: 'quan0401',
        avatarColor: 'red'
      }
    ) as Request;

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Avatar image is required');
    });
  });

  it('Should throw unauthorized if user already exist', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'validus',
        email: 'dongminhquan2004@gmail.com',
        password: 'quan0401',
        avatarColor: 'red',
        avatarImage: 'https://res.cloudinary.com/vdg3fsapzu/image/upload/1690974751/social/64ca3a1d4e12ac4b6c7f766c.jpg'
      }
    ) as Request;

    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('User already exists');
    });
  });

  it('Should be successful if everything is right', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'validus',
        email: 'dongminhquan2004@gmail.com',
        password: 'quan0401',
        avatarColor: 'red',
        avatarImage: 'https://res.cloudinary.com/vdg3fsapzu/image/upload/1690974751/social/64ca3a1d4e12ac4b6c7f766c.jpg'
      }
    ) as Request;

    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as unknown as IAuthDocument);

    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    // jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => ({ public_id: '1234', version: '1234' }));
    jest.spyOn(cloudinaryUploads, 'uploads').mockResolvedValue({ public_id: '1234', version: '1234' } as any);

    await SignUp.prototype.create(req, res);

    // expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'Created successfull',
      // user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    });
  });
});
