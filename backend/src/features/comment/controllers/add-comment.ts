import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { ICommentDocument, ICommentJob } from '~comment/interfaces/comment.interface';
import { commentQueue } from '~services/queues/comment.queue';
import { CommentCache } from '~services/redis/comment.cache';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { addCommentSchema } from '~comment/schemes/comment.scheme';

const commentCache: CommentCache = new CommentCache();

export class AddComment {
  @joiValidation(addCommentSchema)
  public async addComment(req: Request, res: Response): Promise<void> {
    const { avatarColor, postId, profilePicture, comment, userTo } = req.body;
    const commetObjectId: ObjectId = new ObjectId();

    const commentData: ICommentDocument = {
      _id: commetObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      avatarColor,
      postId,
      comment,
      profilePicture,
      createdAt: new Date(),
      userTo
    } as ICommentDocument;

    await commentCache.saveCommentToCache(postId, commentData);

    const commentJob: ICommentJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      comment: commentData,
      username: req.currentUser!.username
    };

    commentQueue.addCommentJob('addCommentToDB', commentJob);
    res.status(HTTP_STATUS.CREATED).json({ message: 'Comment created successfully' });
  }
}
