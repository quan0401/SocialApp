import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { commentService } from '~services/db/comment.service';
import { CommentCache } from '~services/redis/comment.cache';
import { ICommentDocument, ICommentNameList } from '~comment/interfaces/comment.interface';
import mongoose from 'mongoose';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { getCommentSchema } from '~comment/schemes/comment.scheme';

const commentCache: CommentCache = new CommentCache();

export class GetComment {
  @joiValidation(getCommentSchema)
  public async getCommentsOfPost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const commentsFromCache: ICommentDocument[] = await commentCache.getCommentsOfPost(postId);
    const comments: ICommentDocument[] = commentsFromCache.length
      ? commentsFromCache
      : await commentService.getCommentsFromPost({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: 'Get comments from post', comments, count: comments.length });
  }

  @joiValidation(getCommentSchema)
  public async getCommetNamesOfPost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;

    const repylyFromCache: ICommentNameList = await commentCache.getCommentNamesOfPost(postId);
    const reply: ICommentNameList =
      repylyFromCache.count > 0
        ? repylyFromCache
        : await commentService.getCommentNamesFromPost({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ message: "Get comments' name", names: reply.names, count: reply.count });
  }

  @joiValidation(getCommentSchema)
  public async getCommentById(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;

    const commentFromCache: ICommentDocument = await commentCache.getCommentById(postId, commentId);
    const comment = commentFromCache
      ? commentFromCache
      : await commentService.getCommentById({ _id: new mongoose.Types.ObjectId(commentId) });

    res.status(HTTP_STATUS.OK).json({ message: 'Get comment', comments: [comment] });
  }
}
