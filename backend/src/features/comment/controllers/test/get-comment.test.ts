import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { CommentCache } from '~services/redis/comment.cache';

import { authUserPayload } from '~mocks/auth.mock';
import { CustomError } from '~global/helpers/error-handler';
import { commentMockRequest, commentMockResponse, mockCommentDocument, mockCommentNameList, mockCommentPayload } from '~mocks/comment.mock';
import { ICommentDocument } from '~comment/interfaces/comment.interface';
import { GetComment } from '../get-comment';
import { commentService } from '~services/db/comment.service';
import mongoose from 'mongoose';

jest.useFakeTimers();
jest.mock('~services/queues/comment.queue');
jest.mock('~services/redis/comment.cache');
jest.mock('~services/queues/base.queue');

const POST_ID = '6027f77087c9d9ccb1555268';
const COMMENT_ID = '6027f77087c9d9ccb1555269';

describe('Get comment: getCommentsOfPost', () => {
  it('Should throw error if there is not allow keys in the body', () => {
    const req: Request = commentMockRequest({ jwt: 'jwt' }, mockCommentPayload, authUserPayload, {
      postId: POST_ID
    }) as Request;

    const res: Response = commentMockResponse();

    GetComment.prototype.getCommentsOfPost(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });
  });

  it('Exist data in cache, send correct json response', async () => {
    const req: Request = commentMockRequest({ jwt: 'jwt' }, {}, authUserPayload, { postId: POST_ID }) as Request;

    const res: Response = commentMockResponse();

    const comments: ICommentDocument[] = [mockCommentDocument];

    jest.spyOn(CommentCache.prototype, 'getCommentsOfPost').mockResolvedValue(comments);
    jest.spyOn(commentService, 'getCommentsFromPost');

    await GetComment.prototype.getCommentsOfPost(req, res);

    expect(CommentCache.prototype.getCommentsOfPost).toHaveBeenCalledWith(POST_ID);
    expect(commentService.getCommentsFromPost).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({ message: 'Get comments from post', comments: comments, count: comments.length });
  });

  it('No data in cache, send correct json response', async () => {
    const req: Request = commentMockRequest({ jwt: 'jwt' }, {}, authUserPayload, { postId: POST_ID }) as Request;

    const res: Response = commentMockResponse();

    const comments: ICommentDocument[] = [mockCommentDocument];

    jest.spyOn(CommentCache.prototype, 'getCommentsOfPost').mockResolvedValue([]);
    jest.spyOn(commentService, 'getCommentsFromPost').mockResolvedValue(comments);

    await GetComment.prototype.getCommentsOfPost(req, res);

    expect(CommentCache.prototype.getCommentsOfPost).toHaveBeenCalledWith(POST_ID);
    expect(commentService.getCommentsFromPost).toHaveBeenCalledWith({ postId: new mongoose.Types.ObjectId(POST_ID) }, { createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({ message: 'Get comments from post', comments: comments, count: comments.length });
  });
});

describe('Get comment: getCommetNamesOfPost', () => {
  it('Should throw error if there is not allow keys in the body', () => {
    const req: Request = commentMockRequest({ jwt: 'jwt' }, mockCommentPayload, authUserPayload, {
      postId: POST_ID
    }) as Request;

    const res: Response = commentMockResponse();

    GetComment.prototype.getCommetNamesOfPost(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });
  });

  it('Exist data in cache, send correct json response', async () => {
    const req: Request = commentMockRequest({ jwt: 'jwt' }, {}, authUserPayload, { postId: POST_ID }) as Request;

    const res: Response = commentMockResponse();

    const comments: ICommentDocument[] = [mockCommentDocument];

    jest.spyOn(CommentCache.prototype, 'getCommentNamesOfPost').mockResolvedValue(mockCommentNameList);
    jest.spyOn(commentService, 'getCommentNamesFromPost');

    await GetComment.prototype.getCommetNamesOfPost(req, res);

    expect(CommentCache.prototype.getCommentNamesOfPost).toHaveBeenCalledWith(POST_ID);
    expect(commentService.getCommentNamesFromPost).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Get comments name',
      names: mockCommentNameList.names,
      count: mockCommentNameList.count
    });
  });

  it('No data in cache, send correct json response', async () => {
    const req: Request = commentMockRequest({ jwt: 'jwt' }, {}, authUserPayload, { postId: POST_ID }) as Request;

    const res: Response = commentMockResponse();

    jest.spyOn(CommentCache.prototype, 'getCommentNamesOfPost').mockResolvedValue({ names: [], count: 0 });
    jest.spyOn(commentService, 'getCommentNamesFromPost').mockResolvedValue(mockCommentNameList);

    await GetComment.prototype.getCommetNamesOfPost(req, res);

    expect(CommentCache.prototype.getCommentNamesOfPost).toHaveBeenCalledWith(POST_ID);
    expect(commentService.getCommentNamesFromPost).toHaveBeenCalledWith(
      { postId: new mongoose.Types.ObjectId(POST_ID) },
      { createdAt: -1 }
    );
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Get comments name',
      names: mockCommentNameList.names,
      count: mockCommentNameList.count
    });
  });
});

describe('Get comment: getCommentById', () => {
  it('Should throw error if there is not allow keys in the body', () => {
    const req: Request = commentMockRequest({ jwt: 'jwt' }, mockCommentPayload, authUserPayload, {
      postId: POST_ID
    }) as Request;

    const res: Response = commentMockResponse();

    GetComment.prototype.getCommentById(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });
  });

  it('Exist data in cache, send correct json response', async () => {
    const req: Request = commentMockRequest({ jwt: 'jwt' }, {}, authUserPayload, { postId: POST_ID, commentId: COMMENT_ID }) as Request;

    const res: Response = commentMockResponse();

    jest.spyOn(CommentCache.prototype, 'getCommentById').mockResolvedValue(mockCommentDocument);
    jest.spyOn(commentService, 'getCommentById');

    await GetComment.prototype.getCommentById(req, res);

    expect(CommentCache.prototype.getCommentById).toHaveBeenCalledWith(POST_ID, COMMENT_ID);
    expect(commentService.getCommentById).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Get comment',
      comments: [mockCommentDocument]
    });
  });

  it('No data in cache, send correct json response', async () => {
    const req: Request = commentMockRequest({ jwt: 'jwt' }, {}, authUserPayload, { postId: POST_ID, commentId: COMMENT_ID }) as Request;

    const res: Response = commentMockResponse();

    jest.spyOn(CommentCache.prototype, 'getCommentById').mockResolvedValue(undefined as any);
    jest.spyOn(commentService, 'getCommentById').mockResolvedValue(mockCommentDocument);

    await GetComment.prototype.getCommentById(req, res);

    expect(CommentCache.prototype.getCommentById).toHaveBeenCalledWith(POST_ID, COMMENT_ID);
    expect(commentService.getCommentById).toHaveBeenCalledWith({ _id: new mongoose.Types.ObjectId(COMMENT_ID) });
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({ message: 'Get comment', comments: [mockCommentDocument] });
  });
});
