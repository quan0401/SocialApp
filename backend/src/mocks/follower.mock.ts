import { AuthPayload } from '~auth/interfaces/auth.interface';
import { Request, Response } from 'express';

export const mockFollowerRequest: (params: IParams, currentUser: AuthPayload) => Request = (params: IParams, currentUser: AuthPayload) =>
  ({
    params,
    currentUser
  }) as unknown as Request;

export const mockFollowerResponse: () => Response = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  return res;
};

interface IParams {
  followeeId: string;
}
