import { chatQueue } from '~services/queues/chat.queue';
import { ChatCache } from '~services/redis/chat.cache';
import * as socketServer from '~sockets/chat.socket';
import { Request, Response } from 'express';

import { Server } from 'socket.io';
import { chatMockRequest, chatMockResponse, messageDataMock } from '~mocks/chat.mock';
import { authUserPayload } from '~mocks/auth.mock';
import _ from 'lodash';

import { userMock } from '~mocks/user.mock';
import { DeleteChat } from '~chat/controllers/delete-chat-message';

jest.useFakeTimers();
jest.mock('~services/queues/chat.queue');
jest.mock('~services/queues/email.queue');
jest.mock('~services/redis/chat.cache');
jest.mock('~services/redis/user.cache');
jest.mock('~services/queues/base.queue');
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

describe('DeleteChat', () => {
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
      conversationId: messageDataMock.conversationId as string,
      messageId: messageDataMock._id as string,
      type: 'sad'
    });
    const res: Response = chatMockResponse();

    jest.spyOn(ChatCache.prototype, 'markMessageAsDeleted').mockResolvedValue(messageDataMock);
    jest.spyOn(socketServer.socketChatObject, 'emit');

    jest.spyOn(chatQueue, 'addChatJob');
    await DeleteChat.prototype.markMessageAsDeleted(req, res);

    expect(ChatCache.prototype.markMessageAsDeleted).toHaveBeenCalledWith(
      req.params.senderId,
      req.params.conversationId,
      req.params.messageId,
      req.params.type
    );
    expect(socketServer.socketChatObject.emit).toHaveBeenNthCalledWith(1, 'message read', messageDataMock);
    expect(socketServer.socketChatObject.emit).toHaveBeenNthCalledWith(2, 'chat list', messageDataMock);
  });
});
