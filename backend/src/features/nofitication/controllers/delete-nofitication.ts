import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { nofiticationQueue } from '~services/queues/nofitication.queue';
import { socketIONofitcationObject } from '~sockets/nofitication.socket';

export class DeleteNofitication {
  public async delete(req: Request, res: Response): Promise<void> {
    const { nofiticationId } = req.params;
    socketIONofitcationObject.emit('delete nofitication', nofiticationId);
    nofiticationQueue.addNofiticationJob('deleteNofitication', { key: nofiticationId });
    res.status(HTTP_STATUS.OK).json({ message: 'Nofitication deleted successfully' });
  }
}
