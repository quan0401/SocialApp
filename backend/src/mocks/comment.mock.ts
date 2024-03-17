import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { AuthPayload } from '~auth/interfaces/auth.interface';
import { ICommentDocument, ICommentNameList } from '~comment/interfaces/comment.interface';
import { authUserPayload } from './auth.mock';

export const commentMockRequest = (sessionData: IJWT, body: IBody, currentUser?: AuthPayload | null, params?: IParams) => ({
  session: sessionData,
  body,
  currentUser,
  params
});

export const commentMockResponse: () => Response = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  return res;
};

interface IBody {
  avatarColor?: string;
  postId?: string;
  profilePicture?: string;
  comment?: string;
  userTo?: string;
}
interface IParams {
  postId?: string;
  commentId?: string;
}

interface IJWT {
  jwt?: string;
}

export const mockCommentPayload: Required<IBody> = {
  avatarColor: 'blue',
  postId: '64d3615382e9d766c93d9aa5',
  profilePicture: 'https://res.cloudinary.com/vdg3fsapzu/image/upload/1691474164/social/64d1d8eeffde0ce3a2bbd12d.jpg',
  comment: 'stay happy',
  userTo: '64d7176700dd5991fa36e90d'
};

export const mockCommentDocument: ICommentDocument = {
  _id: new ObjectId(),
  userId: authUserPayload.userId,
  username: authUserPayload.username,
  avatarColor: authUserPayload.avatarColor,
  postId: 'postId',
  comment: 'commenting ......',
  profilePicture: 'https://res.cloudinary.com/vdg3fsapzu/image/upload/1691474164/social/64d1d8eeffde0ce3a2bbd12d.jpg',
  createdAt: new Date(),
  userTo: 'userToId'
} as ICommentDocument;

export const mockCommentNameList: ICommentNameList = {
  names: ['Quan', 'Tram'],
  count: 2
};
