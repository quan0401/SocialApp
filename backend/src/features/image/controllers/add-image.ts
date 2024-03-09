import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { config } from '~/config';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { uploads } from '~global/helpers/cloudinary-upload';
import { BadRequesetError } from '~global/helpers/error-handler';
import { imageSchema } from '~image/schemes/image.scheme';
import { imageQueue } from '~services/queues/image.queue';
import { UserCache } from '~services/redis/user.cache';
import { IUserDocument } from '~user/interfaces/user.interface';
import { socketImageObject } from '~sockets/image.socket';
import { IBgUploadResponse } from '~image/interfaces/image.interface';
import { Helpers } from '~global/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';

const userCache: UserCache = new UserCache();

export class AddImage {
  @joiValidation(imageSchema)
  public async profile(req: Request, res: Response): Promise<void> {
    const { image } = req.body;
    const userId: string = req.currentUser!.userId;
    const result = await uploads(image, userId, true, true);
    if (!result?.public_id) {
      throw new BadRequesetError('File upload: Error occured. Try again.');
    }
    const url = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${result.public_id.toString()}.jpg`;
    const cacheUser: IUserDocument = (await userCache.updateSingleFieldInCache(
      req.currentUser!.userId,
      'profilePicture',
      url
    )) as IUserDocument;
    socketImageObject.emit('update user', cacheUser);
    imageQueue.addImageJob('addUserProfileImageToDB', { key: userId, value: url, imgId: result.public_id, imgVersion: result.version });
    res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' });
  }

  @joiValidation(imageSchema)
  public async backgroundImageUpload(req: Request, res: Response): Promise<void> {
    const { version, publicId } = (await AddImage.prototype.backgroundUpload(req.body.image)) as IBgUploadResponse;
    const userId: string = req.currentUser!.userId;

    const bgImageId: Promise<IUserDocument> = userCache.updateSingleFieldInCache(userId, 'bgImageId', publicId) as Promise<IUserDocument>;
    const bgImageVersion: Promise<IUserDocument> = userCache.updateSingleFieldInCache(
      userId,
      'bgImageVersion',
      version
    ) as Promise<IUserDocument>;
    const response: [IUserDocument, IUserDocument] = await Promise.all([bgImageId, bgImageVersion]);
    socketImageObject.emit('update user', { bgImageId, bgImageVersion, user: response[0] });
    imageQueue.addImageJob('updateBgImageInDB', {
      key: userId,
      imgId: publicId,
      imgVersion: version
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' });
  }

  private async backgroundUpload(image: string): Promise<IBgUploadResponse> {
    const isDataUrl = Helpers.isDataUrl(image);
    let version = '';
    let publicId = '';
    if (isDataUrl) {
      const result: UploadApiResponse = (await uploads(image)) as UploadApiResponse;
      if (!result?.public_id) {
        throw new BadRequesetError(result.message);
      } else {
        version = result.version.toString();
        publicId = result.publicId;
      }
    } else {
      const value = image.split('/');
      version = value[value.length - 3];
      publicId = `${value[value.length - 2]}/${value[value.length - 1].split('.')[0]}`;
    }
    return { version: version.replace(/v/g, ''), publicId };
  }
}
