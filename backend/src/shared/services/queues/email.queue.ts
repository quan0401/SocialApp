import { IEmailJob } from '~user/interfaces/user.interface';
import { BaseQueue } from './base.queue';
import { emailWorker } from '~workers/email.worker';

class EmailQueue extends BaseQueue {
  constructor() {
    super('EmailQueue');
    this.proccessJob('forgotPasswordEmail', 5, emailWorker.addNofiticationEmail);
    this.proccessJob('commentEmail', 5, emailWorker.addNofiticationEmail);
    this.proccessJob('followerEmail', 5, emailWorker.addNofiticationEmail);
    this.proccessJob('reactionEmail', 5, emailWorker.addNofiticationEmail);
  }
  public addEmailJob(name: string, data: IEmailJob): void {
    this.addJob(name, data);
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
