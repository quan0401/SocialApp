import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { imageQueue } from '~services/queues/image.queue';
import { socketImageObject } from '~sockets/image.socket';
import { IFileImageDocument } from '~image/interfaces/image.interface';
import { imageService } from '~services/db/image.service';
import { IUserDocument } from '~user/interfaces/user.interface';
import { UserCache } from '~services/redis/user.cache';
import { userQueue } from '~services/queues/user.queue';
import { BadRequesetError } from '~global/helpers/error-handler';

const userCache: UserCache = new UserCache();

export class DeleteImage {
  public async image(req: Request, res: Response): Promise<void> {
    const { imageId } = req.body;
    if (!imageId) throw new BadRequesetError('Must have imageId in body');
    socketImageObject.emit('delete image', imageId);
    imageQueue.addImageJob('removeImageFromDB', { imageId });
    res.status(HTTP_STATUS.OK).json({ message: 'Deleted image successfully', imageId });
  }

  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const image: IFileImageDocument = await imageService.getImgByBackgroundId(decodeURIComponent(req.params.bgImageId));
    if (!image?._id) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Image not found' });
      return;
    }
    socketImageObject.emit('delete image', image?._id);
    const bgImageId: Promise<IUserDocument> = userCache.updateSingleFieldInCache(
      req.currentUser!.userId,
      'bgImageId',
      ''
    ) as Promise<IUserDocument>;
    const bgImageVersion: Promise<IUserDocument> = userCache.updateSingleFieldInCache(
      req.currentUser!.userId,
      'bgImageVersion',
      ''
    ) as Promise<IUserDocument>;

    await Promise.all([bgImageId, bgImageVersion]);

    userQueue.addUserJob('updateSingleField', { keyOne: req.currentUser!.userId, keyTwo: 'bgImageId', value: '' });
    userQueue.addUserJob('updateSingleField', { keyOne: req.currentUser!.userId, keyTwo: 'bgImageVersion', value: '' });

    imageQueue.addImageJob('removeImageFromDB', { imageId: image._id });
    res.status(HTTP_STATUS.OK).json({ message: 'Deleted image successfully' });
  }
}
