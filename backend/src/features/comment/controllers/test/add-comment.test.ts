import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';

import { commentQueue } from '~services/queues/comment.queue';
import { CommentCache } from '~services/redis/comment.cache';
import { BaseQueue } from '~services/queues/base.queue';

import { authUserPayload } from '~mocks/auth.mock';
import { AddComment } from '../add-comment';
import { CustomError } from '~global/helpers/error-handler';
import { commentMockRequest, commentMockResponse, mockCommentPayload } from '~mocks/comment.mock';
import { ICommentDocument, ICommentJob } from '~comment/interfaces/comment.interface';

jest.useFakeTimers();
jest.mock('~services/queues/comment.queue');
jest.mock('~services/redis/comment.cache');
jest.mock('~services/queues/base.queue');

describe('Add comment', () => {
  it('Should throw error if there is not allow keys in the body', () => {
    const req: Request = commentMockRequest({ jwt: 'jwt' }, mockCommentPayload, authUserPayload, {
      postId: 'postId1234'
    }) as Request;

    const res: Response = commentMockResponse();

    AddComment.prototype.addComment(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toBe(HTTP_STATUS.BAD_REQUEST);
    });
  });

  it('Should send correct json response', async () => {
    const req: Request = commentMockRequest({ jwt: 'jwt' }, mockCommentPayload, authUserPayload, { postId: 'postId1234' }) as Request;

    const res: Response = commentMockResponse();

    const spy = jest.spyOn(CommentCache.prototype, 'saveCommentToCache');

    const objectId: ObjectId = spy.mock.calls[0][1]._id as ObjectId;

    const commentData: ICommentDocumentWithoutId = {
      _id: objectId,
      userId: authUserPayload.userId,
      username: authUserPayload.username,
      createdAt: new Date(),
      ...mockCommentPayload
    } as ICommentDocumentWithoutId;

    const commentJob: ICommentJob = {
      postId: mockCommentPayload.postId,
      userTo: mockCommentPayload.userTo,
      userFrom: authUserPayload.userId,
      comment: commentData,
      username: authUserPayload.username
    };

    await AddComment.prototype.addComment(req, res);

    expect(CommentCache.prototype.saveCommentToCache).toHaveBeenCalledWith(mockCommentPayload.postId, commentData);
    expect(commentQueue.addCommentJob).toHaveBeenCalledWith('addCommentToDB', commentJob);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    expect(res.json).toHaveBeenCalledWith({ message: 'Comment created successfully' });
  });
});

interface ICommentDocumentWithoutId extends ICommentDocument {
  _id?: ObjectId;
}
