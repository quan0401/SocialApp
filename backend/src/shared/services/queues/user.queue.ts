import { userWorker } from '~workers/user.worker';
import { BaseQueue } from './base.queue';
import { IUserJob } from '~user/interfaces/user.interface';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.proccessJob('addUserToDB', 5, userWorker.addUserToDB);
    this.proccessJob('updateSingleField', 5, userWorker.updateSingleField);
  }

  public addUserJob(name: string, data: IUserJob): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
