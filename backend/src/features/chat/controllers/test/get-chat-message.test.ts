import { chatQueue } from '~services/queues/chat.queue';
import { ChatCache } from '~services/redis/chat.cache';
import * as socketServer from '~sockets/chat.socket';
import { Request, Response } from 'express';

import { Server } from 'socket.io';
import { chatMockRequest, chatMockResponse, messageDataMock } from '~mocks/chat.mock';
import { authUserPayload } from '~mocks/auth.mock';
import _ from 'lodash';

import { userMock } from '~mocks/user.mock';
import { GetChatMessage } from '~chat/controllers/get-chat-messages';
import { IMessageData } from '~chat/interfaces/chat.interface';
import { chatService } from '~services/db/chat.service';
import mongoose from 'mongoose';

jest.useFakeTimers();
jest.mock('~services/queues/chat.queue');
jest.mock('~services/queues/email.queue');
jest.mock('~services/redis/chat.cache');
jest.mock('~services/redis/user.cache');
jest.mock('~services/queues/base.queue');
jest.mock('~services/db/chat.service');
jest.mock('~global/helpers/cloudinary-upload');

Object.defineProperties(socketServer, {
  socketChatObject: {
    value: new Server(),
    writable: true
  }
});

const JWT = 'jwt1234';
const PUBLIC_ID = 'public_id';
const VERSION = 1234;

describe('GetChatMessage: list', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();

    jest.clearAllTimers();
  });

  it('Send correct json response, data in cache', async () => {
    const req: Request = chatMockRequest({ jwt: JWT }, {} as any, authUserPayload, {
      senderId: userMock._id as string,
      conversationId: messageDataMock.conversationId as string,
      messageId: messageDataMock._id as string,
      type: 'sad'
    });
    const res: Response = chatMockResponse();
    const messages: IMessageData[] = [messageDataMock];

    jest.spyOn(ChatCache.prototype, 'getUserConversationList').mockResolvedValue(messages);
    jest.spyOn(chatService, 'getUserConversationList');

    await GetChatMessage.prototype.list(req, res);

    expect(ChatCache.prototype.getUserConversationList).toHaveBeenCalledWith(req.currentUser?.userId);
    expect(chatService.getUserConversationList).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'User conversation list', list: messages });
  });
  it('Send correct json response, no data in cache', async () => {
    const req: Request = chatMockRequest({ jwt: JWT }, {} as any, authUserPayload, {
      senderId: userMock._id as string,
      conversationId: messageDataMock.conversationId as string,
      messageId: messageDataMock._id as string,
      type: 'sad'
    });
    const res: Response = chatMockResponse();
    const messages: IMessageData[] = [messageDataMock];

    jest.spyOn(ChatCache.prototype, 'getUserConversationList').mockResolvedValue([]);
    jest.spyOn(chatService, 'getUserConversationList').mockResolvedValue(messages);

    await GetChatMessage.prototype.list(req, res);

    expect(ChatCache.prototype.getUserConversationList).toHaveBeenCalledWith(req.currentUser?.userId);
    expect(chatService.getUserConversationList).toHaveBeenCalledWith(new mongoose.Types.ObjectId(req.currentUser!.userId));
    expect(res.json).toHaveBeenCalledWith({ message: 'User conversation list', list: messages });
  });
});
