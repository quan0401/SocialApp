import { socketIOPostObject } from './../../../../shared/sockets/post.socket';
import HTTP_STATUS from 'http-status-codes';

import { DeletePost } from '~post/controllers/delete-post';

import { postQueue } from '~services/queues/post.queue';
import { PostCache } from '~services/redis/post.cache';
import { Request, Response } from 'express';
import { postMockRequest, postMockResponse } from '~mocks/post.mock';
import { userMock } from '~mocks/user.mock';
import { Server } from 'socket.io';
import * as postServer from '~sockets/post.socket';

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
});

jest.useFakeTimers();
jest.mock('~services/queues/post.queue');
jest.mock('~services/queues/base.queue');
jest.mock('~services/redis/post.cache');

describe('Delete post', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('Should send correct json', async () => {
    const req: Request = postMockRequest({}, { userId: userMock._id } as any, { postId: '1234' }) as Request;
    const res: Response = postMockResponse();

    jest.spyOn(postServer.socketIOPostObject, 'emit');
    jest.spyOn(PostCache.prototype, 'deletePostFromCache');
    jest.spyOn(postQueue, 'addPostJob');

    await DeletePost.prototype.delete(req, res);

    expect(PostCache.prototype.deletePostFromCache).toHaveBeenCalledWith('1234', userMock._id);
    expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('delete post', req.params.postId);
    expect(postQueue.addPostJob).toHaveBeenCalledWith('deletePostFromDB', { keyTwo: userMock._id, keyOne: '1234' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Delete post successfully' });
  });
});
