import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '~/config';
import { userService } from '~services/db/user.service';
import { INotificationSettings } from '~user/interfaces/user.interface';

const log: Logger = config.createLogger('userWorker');

class UserWorker {
  public async addUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await userService.addUserData(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async updateSingleField(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, value } = job.data;
      await userService.updateSingleFieldInDB(keyOne, keyTwo, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async updateBasicInfo(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await userService.updateBasicinfoInDB(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async updateSocialLinks(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;

      await userService.updateSocialLinksInDB(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async updateNofiticationsSetting(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await userService.updateNofiticationSettings(key, value as INotificationSettings);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
