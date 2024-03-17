import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '~/config';
import { INotificationJobData } from '~nofitication/interfaces/notification.interface';
import { nofiticationService } from '~services/db/nofitication.service';

const log: Logger = config.createLogger('nofiticationWorker');

export class NoficationWorker {
  public async updateNofitication(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = job.data as INotificationJobData;
      await nofiticationService.updateNofitication(key!);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async deleteNofitication(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key } = job.data as INotificationJobData;
      await nofiticationService.deleteNofitication(key!);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}
