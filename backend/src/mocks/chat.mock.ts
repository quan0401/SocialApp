import { Request, Response } from 'express';
import { IJWT } from './auth.mock';
import mongoose from 'mongoose';
import { AuthPayload } from '~auth/interfaces/auth.interface';
import { IMessageData } from '~chat/interfaces/chat.interface';
import { userMock, userMock2 } from '~/mocks/user.mock';
import { ObjectId } from 'mongodb';
import { IChat } from '~chat/interfaces/chat.interface';

export const chatMockRequest = (sessionData: IJWT, body: IMessage, currentUser?: AuthPayload | null, params?: IChatParams): Request =>
  ({
    session: sessionData,
    body,
    params,
    currentUser
  }) as Request;

export const chatMockResponse = (): Response => {
  const res: Response = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export const mockMessageId = new ObjectId();

export interface IChatParams {
  receiverId?: string;
  conversationId?: string;
  query?: string;
  senderId?: string;
  messageId?: string;
  type?: string;
}

export interface IMessage {
  conversationId?: string | null;
  receiverId?: string;
  senderId?: string;
  messageId?: string;
  reaction?: string;
  type?: string;
  receiverName?: string;
  body?: string;
  gifUrl?: string;
  isRead?: boolean;
  selectedImages?: string[];
  profilePicture?: string;
  createdAt?: Date;
  userId?: string | mongoose.Types.ObjectId;
  image?: string;
}

export const chatMessage = {
  body: 'how are you?',
  conversationId: '602854c81c9ca7939aaeba43',
  gifUrl: '',
  isRead: false,
  receiverId: '60263f14648fed5246e322d9',
  receiverUsername: 'Danny',
  receiverAvatarColor: '#9c27b0',
  receiverProfilePicture: 'http://place-hold.it/500x500',
  selectedImage: '1'
};

export const messageDataMock: IMessageData = {
  _id: `${mockMessageId}`,
  conversationId: new mongoose.Types.ObjectId(chatMessage.conversationId),
  receiverId: '60263f14648fed5246e322d8',
  receiverUsername: chatMessage.receiverUsername,
  receiverAvatarColor: chatMessage.receiverAvatarColor,
  receiverProfilePicture: chatMessage.receiverProfilePicture,
  senderUsername: userMock.username!,
  senderId: `${userMock._id}`,
  senderAvatarColor: userMock.avatarColor!,
  senderProfilePicture: userMock.profilePicture,
  body: chatMessage.body,
  isRead: chatMessage.isRead,
  gifUrl: chatMessage.gifUrl,
  selectedImage: chatMessage.selectedImage,
  reaction: [],
  createdAt: '2022-06-29T12:51:39.483Z',
  deleteForMe: false,
  deleteForEveryone: false
};

export const chatList: IChat[] = [
  {
    receiverId: `${userMock2._id}`,
    conversationId: chatMessage.conversationId
  }
];
