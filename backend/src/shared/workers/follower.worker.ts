import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '~/config';
import { IFollowerJobData } from '~follower/interfaces/follower.interface';
import { followerService } from '~services/db/follower.service';
const log: Logger = config.createLogger('followerWorker');

export class FollowerWorker {
  public async addFollowerToDB(job: Job, done: DoneCallback) {
    try {
      const { keyOne, keyTwo, username, followerDocumentId } = job.data as IFollowerJobData;
      await followerService.addFollowerToDB(keyOne!, keyTwo!, username!, followerDocumentId!);

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async removeFollowerFromDB(job: Job, done: DoneCallback) {
    try {
      const { keyOne, keyTwo } = job.data as IFollowerJobData;
      await followerService.removeFollowerFromDB(keyOne!, keyTwo!);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}
