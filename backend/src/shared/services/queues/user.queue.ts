import { userWorker } from '~workers/user.worker';
import { BaseQueue } from './base.queue';
import { IAuthJob } from '~auth/interfaces/auth.interface';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.proccessJob('addUserToDB', 5, userWorker.addUserToDB);
  }

  public addUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
