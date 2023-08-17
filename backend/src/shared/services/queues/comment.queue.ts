import { ICommentJob } from '~comment/interfaces/comment.interface';
import { BaseQueue } from './base.queue';
import { CommentWorker } from '~workers/comment.worker';

class CommentQueue extends BaseQueue {
  constructor() {
    super('commentQueue');
    this.proccessJob('addCommentToDB', 5, CommentWorker.prototype.addCommentToDB);
  }

  public addCommentJob(name: string, data: ICommentJob) {
    this.addJob(name, data);
  }
}

export const commentQueue: CommentQueue = new CommentQueue();
