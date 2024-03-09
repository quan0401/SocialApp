import { AuthPayload } from '~auth/interfaces/auth.interface';
import { Request, Response } from 'express';
import { IFollowerData } from '~follower/interfaces/follower.interface';
import { userMock } from './user.mock';

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

export const mockFollower: IFollowerData = {
  avatarColor: 'red',
  followersCount: 1,
  followingCount: 1,
  profilePicture: 'profilePicture',
  postsCount: 2,
  username: 'red',
  uId: 'red',
  userProfile: userMock
};
