import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from '~/config';
import { IFileImageJobData } from '~image/interfaces/image.interface';
import { imageService } from '~services/db/image.service';

const log: Logger = config.createLogger('imageWorker');

export class ImageWorker {
  public async addUserProfileImageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value, imgId, imgVersion } = job.data as Required<IFileImageJobData>;
      await imageService.addProfilePicture(key, value, imgId, imgVersion);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async updateBgImageInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, imgId, imgVersion } = job.data as Required<IFileImageJobData>;
      await imageService.addBackgroundImage(key, imgId, imgVersion);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async addImageToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, imgId, imgVersion } = job.data as Required<IFileImageJobData>;
      await imageService.addImage(key, imgId, imgVersion, '');
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  public async removeImageFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { imageId } = job.data as Required<IFileImageJobData>;
      await imageService.removeImage(imageId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}
