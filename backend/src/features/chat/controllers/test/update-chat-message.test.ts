import { chatQueue } from '~services/queues/chat.queue';
import { ChatCache } from '~services/redis/chat.cache';
import * as socketServer from '~sockets/chat.socket';
import { Request, Response } from 'express';

import { Server } from 'socket.io';
import { chatMockRequest, chatMockResponse, messageDataMock } from '~mocks/chat.mock';
import { authUserPayload } from '~mocks/auth.mock';
import _ from 'lodash';

import { userMock } from '~mocks/user.mock';
import { UpdateMessages } from '~chat/controllers/update-chat-message';
import { IMessageData } from '~chat/interfaces/chat.interface';
import { chatService } from '~services/db/chat.service';
import mongoose from 'mongoose';
import { CustomError } from '~global/helpers/error-handler';
import { ObjectId } from 'mongodb';

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

describe('UpdateMessages: markMessagesAsRead', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();

    jest.clearAllTimers();
  });

  it('Send correct json response', async () => {
    const req: Request = chatMockRequest({ jwt: JWT }, {} as any, authUserPayload, {
      senderId: userMock._id as string,
      conversationId: messageDataMock.conversationId as string
    });
    const res: Response = chatMockResponse();

    jest.spyOn(ChatCache.prototype, 'markMessagesAsRead').mockResolvedValue(messageDataMock);
    jest.spyOn(chatService, 'getUserConversationList');
    jest.spyOn(socketServer.socketChatObject, 'emit');
    jest.spyOn(chatQueue, 'addChatJob');

    await UpdateMessages.prototype.markMessagesAsRead(req, res);

    expect(ChatCache.prototype.markMessagesAsRead).toHaveBeenCalledWith(req.params.senderId, req.params.conversationId);
    expect(socketServer.socketChatObject.emit).toHaveBeenNthCalledWith(1, 'message read', messageDataMock);
    expect(socketServer.socketChatObject.emit).toHaveBeenNthCalledWith(2, 'chat list', messageDataMock);
    expect(chatQueue.addChatJob).toHaveBeenCalledWith('markMessagesAsRead', {
      conversationId: req.params.conversationId,
      senderId: req.params.senderId
    });
  });
});

describe('UpdateMessages: updateMessageReaction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();

    jest.clearAllTimers();
  });

  it('Should throw error when missing any required field in req body', () => {
    const req: Request = chatMockRequest({ jwt: JWT }, {} as any, authUserPayload, {
      senderId: userMock._id as string,
      conversationId: messageDataMock.conversationId as string
    });
    const res: Response = chatMockResponse();

    UpdateMessages.prototype.updateMessageReaction(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('messageId is required');
    });
  });
  it('Send correct json response', async () => {
    const req: Request = chatMockRequest(
      { jwt: JWT },
      {
        messageId: messageDataMock._id,
        senderName: userMock.username,
        reaction: 'sad',
        type: 'add',
        conversationId: messageDataMock.conversationId.toString()
      } as any,
      authUserPayload
    );
    const res: Response = chatMockResponse();

    jest.spyOn(ChatCache.prototype, 'updateMessageReaction').mockResolvedValue(messageDataMock);
    jest.spyOn(socketServer.socketChatObject, 'emit');
    jest.spyOn(chatQueue, 'addChatJob');

    await UpdateMessages.prototype.updateMessageReaction(req, res);

    expect(ChatCache.prototype.updateMessageReaction).toHaveBeenCalledWith(
      req.body.conversationId,
      req.body.messageId,
      req.body.senderName,
      req.body.reaction,
      req.body.type
    );
    expect(socketServer.socketChatObject.emit).toHaveBeenNthCalledWith(1, 'message reaction', messageDataMock);

    expect(chatQueue.addChatJob).toHaveBeenCalledWith('updateMessageReaction', {
      messageId: req.body.messageId,
      senderName: req.body.senderName,
      reaction: req.body.reaction,
      type: req.body.type
    });
  });
});
