import { chatQueue } from '~services/queues/chat.queue';
import { emailQueue } from '~services/queues/email.queue';
import { ChatCache } from '~services/redis/chat.cache';
import { UserCache } from '~services/redis/user.cache';
import * as socketServer from '~sockets/chat.socket';
import HTTP_STATUS from 'http-status-codes';
import { UploadApiErrorResponse } from 'cloudinary';
import { Request, Response } from 'express';
import * as cloudinaryUpload from '~global/helpers/cloudinary-upload';
import { AddChatMessage } from '~chat/controllers/add-chat-message';
import { Server } from 'socket.io';
import { chatMessage, chatMockRequest, chatMockResponse } from '~mocks/chat.mock';
import { authUserPayload } from '~mocks/auth.mock';
import _ from 'lodash';
import { CustomError } from '~global/helpers/error-handler';

import { config } from '~/config';
import { userMock } from '~mocks/user.mock';

jest.useFakeTimers();
jest.mock('~services/queues/chat.queue');
jest.mock('~services/queues/email.queue');
jest.mock('~services/redis/chat.cache');
jest.mock('~services/redis/user.cache');
jest.mock('~services/queues/base.queue');
jest.mock('~global/helpers/cloudinary-upload');

Object.defineProperties(socketServer, {
  socketIOChatObject: {
    value: new Server(),
    writable: true
  }
});

const JWT = 'jwt1234';
const PUBLIC_ID = 'public_id';
const VERSION = 1234;

describe('AddChatMessage: add', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();

    jest.clearAllTimers();
  });
  it('Should throw error if missing any field', () => {
    const req: Request = chatMockRequest({ jwt: JWT }, {}, authUserPayload);
    const res: Response = chatMockResponse();

    AddChatMessage.prototype.add(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Receiver ID is required');
    });
  });
  it('Should throw error if uploading image fail', () => {
    const req: Request = chatMockRequest({ jwt: JWT }, chatMessage, authUserPayload);
    const res: Response = chatMockResponse();

    jest.spyOn(cloudinaryUpload, 'uploads').mockResolvedValue({ message: 'Uploading failed' } as UploadApiErrorResponse);

    AddChatMessage.prototype.add(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Uploading failed');
    });
  });

  it('Should send correct json response, with sending email', async () => {
    const req: Request = chatMockRequest({ jwt: JWT }, chatMessage, authUserPayload);
    const res: Response = chatMockResponse();

    const fileUrl = `https://res.cloudinary.com/v${config.CLOUD_NAME}/image/upload/${VERSION}/${config.FOLDER}/${req.currentUser?.userId}.jpg`;

    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(userMock);
    jest.spyOn(cloudinaryUpload, 'uploads').mockResolvedValue({ public_id: PUBLIC_ID, version: VERSION } as any);

    const spy = jest.spyOn(ChatCache.prototype, 'addChatToListInCache');
    jest.spyOn(ChatCache.prototype, 'addChatMessageToCache');
    const chatQueueSpy = jest.spyOn(chatQueue, 'addChatJob');
    jest.spyOn(socketServer.socketIOChatObject, 'emit');
    jest.spyOn(emailQueue, 'addEmailJob');
    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(userMock);

    await AddChatMessage.prototype.add(req, res);

    const messageData = chatQueueSpy.mock.calls[0][1];
    const receiverId = spy.mock.calls[0][1];
    const conversationObjectId = spy.mock.calls[0][2];

    expect(ChatCache.prototype.addChatToListInCache).toHaveBeenNthCalledWith(1, req.currentUser!.userId, receiverId, conversationObjectId);
    expect(ChatCache.prototype.addChatToListInCache).toHaveBeenNthCalledWith(2, receiverId, req.currentUser!.userId, conversationObjectId);
    expect(ChatCache.prototype.addChatMessageToCache).toHaveBeenNthCalledWith(1, conversationObjectId, messageData);
    expect(chatQueue.addChatJob).toHaveBeenCalled();
    expect(emailQueue.addEmailJob).toHaveBeenCalled();
    expect(socketServer.socketIOChatObject.emit).toHaveBeenNthCalledWith(1, 'message received', messageData);
    expect(socketServer.socketIOChatObject.emit).toHaveBeenNthCalledWith(2, 'chat list', messageData);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
  });

  it('Should send correct json response, without sending email (user turns off nofitication)', async () => {
    const req: Request = chatMockRequest({ jwt: JWT }, chatMessage, authUserPayload);
    const res: Response = chatMockResponse();
    userMock.notifications.messages = false;

    const fileUrl = `https://res.cloudinary.com/v${config.CLOUD_NAME}/image/upload/${VERSION}/${config.FOLDER}/${req.currentUser?.userId}.jpg`;

    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(userMock);
    jest.spyOn(cloudinaryUpload, 'uploads').mockResolvedValue({ public_id: PUBLIC_ID, version: VERSION } as any);

    const spy = jest.spyOn(ChatCache.prototype, 'addChatToListInCache');
    jest.spyOn(ChatCache.prototype, 'addChatMessageToCache');
    const chatQueueSpy = jest.spyOn(chatQueue, 'addChatJob');
    jest.spyOn(socketServer.socketIOChatObject, 'emit');
    jest.spyOn(emailQueue, 'addEmailJob');
    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(userMock);

    await AddChatMessage.prototype.add(req, res);

    const messageData = chatQueueSpy.mock.calls[0][1];
    const receiverId = spy.mock.calls[0][1];
    const conversationObjectId = spy.mock.calls[0][2];

    expect(ChatCache.prototype.addChatToListInCache).toHaveBeenNthCalledWith(1, req.currentUser!.userId, receiverId, conversationObjectId);
    expect(ChatCache.prototype.addChatToListInCache).toHaveBeenNthCalledWith(2, receiverId, req.currentUser!.userId, conversationObjectId);
    expect(ChatCache.prototype.addChatMessageToCache).toHaveBeenNthCalledWith(1, conversationObjectId, messageData);
    expect(chatQueue.addChatJob).toHaveBeenCalled();
    expect(emailQueue.addEmailJob).not.toHaveBeenCalled();
    expect(socketServer.socketIOChatObject.emit).toHaveBeenNthCalledWith(1, 'message received', messageData);
    expect(socketServer.socketIOChatObject.emit).toHaveBeenNthCalledWith(2, 'chat list', messageData);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
  });

  it('Should send correct json response, without sending email (message is read)', async () => {
    const req: Request = chatMockRequest({ jwt: JWT }, chatMessage, authUserPayload);
    const res: Response = chatMockResponse();
    chatMessage.isRead = true;

    const fileUrl = `https://res.cloudinary.com/v${config.CLOUD_NAME}/image/upload/${VERSION}/${config.FOLDER}/${req.currentUser?.userId}.jpg`;

    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(userMock);
    jest.spyOn(cloudinaryUpload, 'uploads').mockResolvedValue({ public_id: PUBLIC_ID, version: VERSION } as any);

    const spy = jest.spyOn(ChatCache.prototype, 'addChatToListInCache');
    jest.spyOn(ChatCache.prototype, 'addChatMessageToCache');
    const chatQueueSpy = jest.spyOn(chatQueue, 'addChatJob');
    jest.spyOn(socketServer.socketIOChatObject, 'emit');
    jest.spyOn(emailQueue, 'addEmailJob');
    jest.spyOn(UserCache.prototype, 'getUserFromCache').mockResolvedValue(userMock);

    await AddChatMessage.prototype.add(req, res);

    const messageData = chatQueueSpy.mock.calls[0][1];
    const receiverId = spy.mock.calls[0][1];
    const conversationObjectId = spy.mock.calls[0][2];

    expect(ChatCache.prototype.addChatToListInCache).toHaveBeenNthCalledWith(1, req.currentUser!.userId, receiverId, conversationObjectId);
    expect(ChatCache.prototype.addChatToListInCache).toHaveBeenNthCalledWith(2, receiverId, req.currentUser!.userId, conversationObjectId);
    expect(ChatCache.prototype.addChatMessageToCache).toHaveBeenNthCalledWith(1, conversationObjectId, messageData);
    expect(chatQueue.addChatJob).toHaveBeenCalled();
    expect(emailQueue.addEmailJob).not.toHaveBeenCalled();
    expect(socketServer.socketIOChatObject.emit).toHaveBeenNthCalledWith(1, 'message received', messageData);
    expect(socketServer.socketIOChatObject.emit).toHaveBeenNthCalledWith(2, 'chat list', messageData);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
  });
});

describe('AddChatMessage: removeChatUsers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();

    jest.clearAllTimers();
  });

  it('Send correct json response', async () => {
    const body = { userOne: '64d1d8eeffde0ce3a2bbd12d', userTwo: '64d7176700dd5991fa36e90e' };
    const req: Request = chatMockRequest({ jwt: JWT }, body as any, authUserPayload);
    const res: Response = chatMockResponse();

    jest.spyOn(ChatCache.prototype, 'removeChatUsersFromCache');

    jest.spyOn(socketServer.socketIOChatObject, 'emit');
    await AddChatMessage.prototype.removeChatUsers(req, res);

    expect(ChatCache.prototype.removeChatUsersFromCache).toHaveBeenCalledWith(body);
    expect(socketServer.socketIOChatObject.emit).toHaveBeenCalled();
  });
});

describe('AddChatMessage: addChatUsers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();

    jest.clearAllTimers();
  });

  it('Send correct json response', async () => {
    const body = { userOne: '64d1d8eeffde0ce3a2bbd12d', userTwo: '64d7176700dd5991fa36e90e' };
    const req: Request = chatMockRequest({ jwt: JWT }, body as any, authUserPayload);
    const res: Response = chatMockResponse();

    jest.spyOn(ChatCache.prototype, 'addChatUsersToCache');

    jest.spyOn(socketServer.socketIOChatObject, 'emit');
    await AddChatMessage.prototype.addChatUsers(req, res);

    expect(ChatCache.prototype.addChatUsersToCache).toHaveBeenCalledWith(body);
    expect(socketServer.socketIOChatObject.emit).toHaveBeenCalled();
  });
});
