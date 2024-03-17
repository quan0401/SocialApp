import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { nofiticationQueue } from '~services/queues/nofitication.queue';
import { socketIONofitcationObject } from '~sockets/nofitication.socket';

export class UpdateNofitication {
  public async update(req: Request, res: Response): Promise<void> {
    const { nofiticationId } = req.params;
    socketIONofitcationObject.emit('update nofitication', nofiticationId);

    nofiticationQueue.addNofiticationJob('updateNofitication', { key: nofiticationId });
    res.status(HTTP_STATUS.OK).json({ message: 'Nofitication marked as read' });
  }
}
