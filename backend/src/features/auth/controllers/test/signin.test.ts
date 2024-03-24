import { Request, Response } from 'express';
import { Signin } from '~auth/controllers/signin';
import { IAuthDocument } from '~auth/interfaces/auth.interface';
import { CustomError } from '~global/helpers/error-handler';
import { authMock, authMockRequest, authMockResponse } from '~mocks/auth.mock';
import { authService } from '~services/db/auth.service';
import { userService } from '~services/db/user.service';
import { IUserDocument } from '~user/interfaces/user.interface';

jest.mock('~services/db/user.service');
jest.mock('~services/queues/base.queue');

describe('Sigin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should throw error if there is no username field', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        password: 'quan0401'
      }
    ) as Request;

    const res: Response = authMockResponse();

    Signin.prototype.signin(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Username is a required field');
    });
  });

  it('Should throw error if there is no passsword field', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'quan0401',
        password: ''
      }
    ) as Request;

    const res: Response = authMockResponse();

    Signin.prototype.signin(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Password is a required field');
    });
  });

  it('Should throw error if the user is not exist', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'quan0401',
        password: 'quan0401'
      }
    ) as Request;

    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getUserByUsername').mockResolvedValue(null as unknown as IAuthDocument);
    Signin.prototype.signin(req, res).catch((error: CustomError) => {
      // expect(error.statusCode).toBe(400);
      // expect(error.serializeErrors().message).toBe('Invalid credentials');
    });
  });

  it('Should throw error if password is incorrect', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'quan0401',
        password: 'quan0401'
      }
    ) as Request;

    const res: Response = authMockResponse();
    jest.spyOn(authService, 'getUserByUsername').mockResolvedValue(authMock);

    Signin.prototype.signin(req, res).catch((error: CustomError) => {
      // expect(error.statusCode).toBe(400);
      // expect(error.serializeErrors().message).toBe('Invalid credentials');
    });
  });

  // it('Should set session and and send correct json for valid credentials', async () => {
  //   const req: Request = authMockRequest(
  //     {},
  //     {
  //       username: 'quan0401',
  //       password: 'quan0401'
  //     }
  //   ) as Request;

  //   const res: Response = authMockResponse();
  //   authMock.comparePassword = () => Promise.resolve(true);
  //   jest.spyOn(authService, 'getUserByUsername').mockResolvedValue(authMock);

  //   jest.spyOn(userService, 'getUserByAuthId').mockResolvedValue({
  //     uId: authMock.uId,
  //     email: authMock.email,
  //     username: authMock.username,
  //     avatarColor: authMock.avatarColor,
  //     userId: '1234'
  //   } as unknown as IUserDocument);

  //   await Signin.prototype.signin(req, res);

  //   expect(req.session?.jwt).toBeDefined();
  //   expect(res.json).toHaveBeenCalledWith({
  //     message: 'User logins successfully',
  //     user: authMock,
  //     token: req.session?.jwt
  //   });
  // });
});
