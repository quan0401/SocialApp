import { ICommentDocument, ICommentNameList } from '~comment/interfaces/comment.interface';
import { BaseCache } from './base.cache';
import { ServerError } from '~global/helpers/error-handler';
import { Helpers } from '~global/helpers/helpers';

export class CommentCache extends BaseCache {
  constructor() {
    super('commentCache');
  }
  public async saveCommentToCache(postId: string, commentData: ICommentDocument): Promise<void> {
    try {
      if (!this.client.isOpen) await this.client.connect();

      await this.client.LPUSH(`comments:${postId}`, JSON.stringify(commentData));
      let commentsCount: number = Helpers.parseJson(await this.client.HMGET(`posts:${postId}`, 'commentsCount'));
      commentsCount++;
      await this.client.HSET(`posts:${postId}`, 'commentsCount', commentsCount);
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Comment cache error. Try again');
    }
  }

  public async getCommentNamesOfPost(postId: string): Promise<ICommentNameList> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const names: string[] = (await this.client.LRANGE(`comments:${postId}`, 0, -1)).map((comment) => {
        {
          const parseComment = Helpers.parseJson(comment) as ICommentDocument;

          return parseComment.username;
        }
      });

      const count = await this.client.LLEN(`comments:${postId}`);

      return { count, names };
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Comment cache error. Try again');
    }
  }

  public async getCommentsOfPost(postId: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const comments: ICommentDocument[] = (await this.client.LRANGE(`comments:${postId}`, 0, -1)).map((comment) =>
        Helpers.parseJson(comment)
      );
      return comments;
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Comment cache error. Try again');
    }
  }

  public async getCommentById(postId: string, commentId: string): Promise<ICommentDocument> {
    try {
      if (!this.client.isOpen) await this.client.connect();
      const comments: ICommentDocument[] = (await this.client.LRANGE(`comments:${postId}`, 0, -1)).map((comment) =>
        Helpers.parseJson(comment)
      );

      const findingComment: ICommentDocument = comments.find((comment) => comment._id === commentId) as ICommentDocument;
      return findingComment;
    } catch (error) {
      this.log.error(error);
      throw new ServerError('Comment cache error. Try again');
    }
  }
}
