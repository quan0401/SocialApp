import { Request, Response } from 'express';
import { AuthPayload } from '~auth/interfaces/auth.interface';
import { IFileImageDocument } from '~image/interfaces/image.interface';
import { authUserPayload } from './auth.mock';

export const mockImageRequest = (body: IBody, params: IParams, currentUser: AuthPayload): Request =>
  ({ body, params, currentUser }) as unknown as Request;

export const mockImageResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  return res;
};

interface IBody {
  image?: string;
}

interface IParams {
  userId?: string;
  imageId?: string;
  bgImageId?: string;
}

export const mockImage: IFileImageDocument = {
  userId: authUserPayload.userId,
  imgId: 'version1234',
  imgVersion: 'social/64d7176700dd5991fa36e90e',
  bgImageId: '',
  bgImageVersion: '',
  createdAt: new Date(),
  _id: '64ec94630372ecced7ef29f2'
} as IFileImageDocument;
