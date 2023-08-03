import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { userService } from '~services/db/user.service';
import { UserCache } from '~services/redis/user.cache';
import { IUserDocument } from '~user/interfaces/user.interface';

export class CurrentUser {
  public async getCurrentUser(req: Request, res: Response): Promise<void> {
    let isUser = false,
      user = null,
      token = null;
    const userCache: UserCache = new UserCache();
    const userFromCache: IUserDocument = (await userCache.getUserFromCache(req.currentUser!.userId)) as IUserDocument;
    const existingUser = userFromCache ? userFromCache : ((await userService.getUserById(req.currentUser!.userId)) as IUserDocument);
    if (Object.keys(existingUser).length) {
      isUser = true;
      token = req.session?.jwt;
      user = existingUser;
    }
    res.status(HTTP_STATUS.OK).json({ isUser, user, token });
  }
}
