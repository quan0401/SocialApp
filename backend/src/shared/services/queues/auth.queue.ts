import { IAuthDocument, IAuthJob } from '~auth/interfaces/auth.interface';
import { BaseQueue } from './base.queue';
import { authWorker } from '~wokers/auth.worker';

class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.proccessJob('addAuthUserToDB', 5, authWorker.addAuthUserToDB);
  }
  public addAuthUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}
export const authQueue: AuthQueue = new AuthQueue();
