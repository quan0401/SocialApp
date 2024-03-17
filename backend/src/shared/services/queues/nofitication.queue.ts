import { INotificationJobData } from '~nofitication/interfaces/notification.interface';
import { BaseQueue } from './base.queue';
import { NoficationWorker } from '~workers/nofitication.worker';

class NofiticationQueue extends BaseQueue {
  constructor() {
    super('nofiticationQueue');
    this.proccessJob('updateNofitication', 5, NoficationWorker.prototype.updateNofitication);
    this.proccessJob('deleteNofitication', 5, NoficationWorker.prototype.deleteNofitication);
  }
  public addNofiticationJob(name: string, data: INotificationJobData): void {
    this.addJob(name, data);
  }
}

export const nofiticationQueue: NofiticationQueue = new NofiticationQueue();
