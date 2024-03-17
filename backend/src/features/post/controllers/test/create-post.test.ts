import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { AuthPayload } from '~auth/interfaces/auth.interface';
import * as cloudinaryUploads from '~global/helpers/cloudinary-upload';
import { CustomError } from '~global/helpers/error-handler';
import { newPost, postMockRequest, postMockResponse } from '~mocks/post.mock';
import { userMock } from '~mocks/user.mock';
import { CreatePost } from '~post/controllers/create-post';

import * as postServer from '~sockets/post.socket';
import { PostCache } from '~services/redis/post.cache';
import { postQueue } from '~services/queues/post.queue';

jest.useFakeTimers();
jest.mock('~services/redis/post.cache');
jest.mock('~services/queues/post.queue');
jest.mock('~global/helpers/cloudinary-upload');
jest.mock('~services/queues/base.queue');

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
});

describe('Create post', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('Should response correct json', async () => {
    const req: Request = postMockRequest(newPost, userMock as any) as Request;
    const res: Response = postMockResponse();
    jest.spyOn(postServer.socketIOPostObject, 'emit');
    const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
    jest.spyOn(postQueue, 'addPostJob');

    await CreatePost.prototype.post(req, res);

    const createdPost = spy.mock.calls[0][0].createdPost;
    expect(postQueue.addPostJob).toHaveBeenCalledWith('addPostToDB', { key: req.currentUser?.userId, value: createdPost });
    expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Post created successfully'
    });
  });
});

describe('Create post with image', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('Should throw error if image is not available', () => {
    const req: Request = postMockRequest(newPost, userMock as unknown as AuthPayload) as Request;
    const res: Response = postMockResponse();

    jest.spyOn(postServer.socketIOPostObject, 'emit');

    CreatePost.prototype.postWithImage(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Image property is not allowed to be empty');
    });
  });

  it('Should throw image upload error', () => {
    newPost.image = 'askldjfkadklf;jkl;';
    const req: Request = postMockRequest(newPost, userMock as any) as Request;
    const res: Response = postMockResponse();

    jest.spyOn(cloudinaryUploads, 'uploads').mockResolvedValue({ message: 'Error uploading' } as any);

    CreatePost.prototype.postWithImage(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(400);
      expect(error.serializeErrors().message).toBe('Error uploading');
    });
  });

  it('Should response correct json', async () => {
    newPost.image = 'askldjfkadklf;jkl;';
    const req: Request = postMockRequest(newPost, userMock as any) as Request;
    const res: Response = postMockResponse();
    jest.spyOn(postServer.socketIOPostObject, 'emit');
    const spy = jest.spyOn(PostCache.prototype, 'savePostToCache');
    jest.spyOn(postQueue, 'addPostJob');
    jest.spyOn(cloudinaryUploads, 'uploads').mockResolvedValue({ public_id: '1234', version: 456 } as UploadApiResponse);

    await CreatePost.prototype.postWithImage(req, res);
    const createdPost = spy.mock.calls[0][0].createdPost;
    expect(createdPost.imgVersion).toBe('456');
    expect(createdPost.imgId).toBe('1234');
    expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('add post', createdPost);
    expect(postQueue.addPostJob).toHaveBeenCalledWith('addPostToDB', { key: req.currentUser?.userId, value: createdPost });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post created with image successfully' });
  });
});
