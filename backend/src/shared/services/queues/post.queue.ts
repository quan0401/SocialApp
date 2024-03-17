import { IPostJobData } from '~post/interfaces/post.interface';
import { BaseQueue } from './base.queue';
import { PostWorker } from '~workers/post.worker';

class PostQueue extends BaseQueue {
  constructor() {
    super('postQueue');
    this.proccessJob('addPostToDB', 5, PostWorker.prototype.addPost);
    this.proccessJob('deletePostFromDB', 5, PostWorker.prototype.deletePost);
    this.proccessJob('updatePostInDB', 5, PostWorker.prototype.updatePost);
  }
  public addPostJob(name: string, data: IPostJobData) {
    this.addJob(name, data);
  }
}
export const postQueue: PostQueue = new PostQueue();
