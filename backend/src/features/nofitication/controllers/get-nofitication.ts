import HTTP_STATUS from 'http-status-codes';
import { Request, Response, json } from 'express';
import { INotificationDocument } from '~nofitication/interfaces/notification.interface';
import { nofiticationService } from '~services/db/nofitication.service';

export class GetNofitication {
  public async get(req: Request, res: Response): Promise<void> {
    const nofitications: INotificationDocument[] = await nofiticationService.getNofitications(req.currentUser!.userId);
    res.status(HTTP_STATUS.OK).json({ message: 'User nofitications', nofitications });
  }
}
