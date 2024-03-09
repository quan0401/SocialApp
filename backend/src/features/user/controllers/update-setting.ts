import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { UserCache } from '~services/redis/user.cache';
import { notificationSettingsSchema } from '~user/schemes/info.scheme';
import { INotificationSettings, IUserDocument } from '~user/interfaces/user.interface';
import { userQueue } from '~services/queues/user.queue';

const userCache: UserCache = new UserCache();
export class UpdateSetting {
  @joiValidation(notificationSettingsSchema)
  public async nofitication(req: Request, res: Response): Promise<void> {
    const userId: string = `${req.currentUser!.userId}`;
    const updatedUser: IUserDocument = (await userCache.updateSingleFieldInCache(userId, 'notifications', req.body)) as IUserDocument;
    userQueue.addUserJob('updateNofiticationsSetting', { key: userId, value: req.body as INotificationSettings });
    res.status(HTTP_STATUS.OK).json({
      message: 'Updated nofitication settings'
    });
  }
}
