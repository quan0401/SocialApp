import { IUserDocument } from '~user/interfaces/user.interface';
import { GetPost } from '~post/controllers/get-post';
import { IPostDocument } from '~post/interfaces/post.interface';
import HTTP_STATUS from 'http-status-codes';
import { PostCache } from '~services/redis/post.cache';
import { postService } from '~services/db/post.service';
import { Request, Response } from 'express';
import { postMockData, postMockRequest, postMockResponse } from '~mocks/post.mock';
import { userMock } from '~mocks/user.mock';
jest.useFakeTimers();
jest.mock('~services/redis/post.cache');
jest.mock('~services/db/post.service');

describe('Get post', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('No post from cache', async () => {
    const req: Request = postMockRequest({}, null, { page: '1' }) as Request;
    const res: Response = postMockResponse();
    jest.spyOn(PostCache.prototype, 'getPostsFromCache').mockResolvedValue([]);
    jest.spyOn(PostCache.prototype, 'getTotalPostCountInCache');
    const spyGet = jest.spyOn(postService, 'getPosts').mockResolvedValue([postMockData]);
    const spy = jest.spyOn(postService, 'postCounts').mockResolvedValue(1);

    await GetPost.prototype.getPosts(req, res);

    expect(postService.getPosts).toHaveBeenCalledWith({}, 0, 10, { createdAt: -1 });
    expect(PostCache.prototype.getTotalPostCountInCache).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({ message: 'All posts', posts: [postMockData], totalPost: 1 });
  });

  it('Exist posts in cache', async () => {
    const req: Request = postMockRequest({}, null, { page: '1' }) as Request;
    const res: Response = postMockResponse();
    const spy = jest.spyOn(PostCache.prototype, 'getPostsFromCache').mockResolvedValue([postMockData]);
    jest.spyOn(PostCache.prototype, 'getTotalPostCountInCache').mockResolvedValue(1);

    // This line creates a spy on the postCounts function, but it doesn't actually modify the behavior of the function. By default, the spy will return undefined, which could lead to the function being called even when you don't intend it to be.
    // jest.spyOn(postService, 'postCounts');
    // jest.spyOn(postService, 'getPosts');

    await GetPost.prototype.getPosts(req, res);

    expect(postService.getPosts).not.toHaveBeenCalled();
    expect(postService.postCounts).not.toHaveBeenCalled();

    expect(PostCache.prototype.getPostsFromCache).toHaveBeenCalledWith('post', 0, 10);
    expect(PostCache.prototype.getTotalPostCountInCache).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({ message: 'All posts', posts: [postMockData], totalPost: 1 });
  });
});
