import { IFollowerJobData } from '~follower/interfaces/follower.interface';
import { BaseQueue } from './base.queue';
import { FollowerWorker } from '~workers/follower.worker';

class FollowerQueue extends BaseQueue {
  constructor() {
    super('followerQueue');
    this.proccessJob('addFollowerToDB', 5, FollowerWorker.prototype.addFollowerToDB);
    this.proccessJob('removeFollowerFromDB', 5, FollowerWorker.prototype.removeFollowerFromDB);
  }

  public addFollowerJob(name: string, data: IFollowerJobData): void {
    this.addJob(name, data);
  }
}

export const followerQueue: FollowerQueue = new FollowerQueue();
