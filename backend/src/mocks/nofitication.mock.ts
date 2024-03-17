import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthPayload } from '~auth/interfaces/auth.interface';
import { INotificationDocument } from '~nofitication/interfaces/notification.interface';

export const mockNofiticationRequest = (params: IParams, currentUser?: AuthPayload): Request => ({ params, currentUser }) as Request;

export const mockNofiticationResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn();
  return res;
};

export const mockNofitication: INotificationDocument = {
  _id: '64d7215900dd5991fa36e90f',
  userTo: '64d7176700dd5991fa36e90e',
  userFrom: '64d7215900dd5991fa36e90f',
  message: 'You have a new notification.',
  notificationType: 'comment',
  entityId: new mongoose.Types.ObjectId('64d7215900dd5991fa36e90f'),
  createdItemId: new mongoose.Types.ObjectId('64d7215900dd5991fa36e90f'),
  comment: 'This is a new comment.',
  reaction: 'like',
  post: '64d3615382e9d766c93d9aa5',
  imgId: '64d7215900dd5991fa36e90f',
  imgVersion: 'v1',
  gifUrl: 'https://example.com/gif.gif',
  read: false,
  createdAt: new Date('2023-07-31T12:34:56.789Z')
} as INotificationDocument;

interface IParams {
  nofiticationId?: string;
}
