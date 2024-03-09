import { userWorker } from '~workers/user.worker';
import { BaseQueue } from './base.queue';
import { IUserJob, IUserJobInfo } from '~user/interfaces/user.interface';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.proccessJob('addUserToDB', 5, userWorker.addUserToDB);
    this.proccessJob('updateSingleField', 5, userWorker.updateSingleField);
    this.proccessJob('updateBasicInfo', 5, userWorker.updateBasicInfo);
    this.proccessJob('updateSocialLinks', 5, userWorker.updateSocialLinks);
    this.proccessJob('updateNofiticationsSetting', 5, userWorker.updateNofiticationsSetting);
  }

  public addUserJob(name: string, data: IUserJob | IUserJobInfo): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
