import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '~services/redis/user.cache';
import { Request, Response } from 'express';
import { joiValidation } from '~global/decorators/joi-validation.decorators';
import { basicInfoSchema, socialLinksSchema } from '~user/schemes/info.scheme';
import { IBasicInfo, ISocialLinks, IUserDocument } from '~user/interfaces/user.interface';
import { userQueue } from '~services/queues/user.queue';

const userCache: UserCache = new UserCache();

export class Edit {
  @joiValidation(socialLinksSchema)
  public async socialLinks(req: Request, res: Response): Promise<void> {
    const userId = `${req.currentUser!.userId}`;
    await userCache.updateSingleFieldInCache(userId, 'social', req.body);
    userQueue.addUserJob('updateSocialLinks', { key: userId, value: req.body as ISocialLinks });
    res.status(HTTP_STATUS.OK).json({
      message: 'Updated Social links'
    });
  }

  @joiValidation(basicInfoSchema)
  public async basicInfo(req: Request, res: Response): Promise<void> {
    const userId = `${req.currentUser!.userId}`;
    for (const [key, value] of Object.entries(req.body)) await userCache.updateSingleFieldInCache(userId, key, value as string);
    userQueue.addUserJob('updateBasicInfo', { key: userId, value: req.body as IBasicInfo });
    res.status(HTTP_STATUS.OK).json({
      message: 'Updated basic info'
    });
  }
}
