import { IFileImageJobData } from '~image/interfaces/image.interface';
import { BaseQueue } from './base.queue';
import { ImageWorker } from '~workers/image.worker';

class ImageQueue extends BaseQueue {
  constructor() {
    super('imageQueue');
    this.proccessJob('addUserProfileImageToDB', 5, ImageWorker.prototype.addUserProfileImageToDB);
    this.proccessJob('addImageToDB', 5, ImageWorker.prototype.addImageToDB);
    this.proccessJob('removeImageFromDB', 5, ImageWorker.prototype.removeImageFromDB);
    this.proccessJob('updateBgImageInDB', 5, ImageWorker.prototype.updateBgImageInDB);
  }
  public addImageJob(name: string, data: IFileImageJobData): void {
    this.addJob(name, data);
  }
}
export const imageQueue: ImageQueue = new ImageQueue();
