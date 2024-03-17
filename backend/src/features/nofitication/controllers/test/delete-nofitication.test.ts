import { Request, Response } from 'express';
import { nofiticationQueue } from '~services/queues/nofitication.queue';
import * as socketServer from '~sockets/nofitication.socket';
import { Server } from 'socket.io';
import { mockNofiticationRequest, mockNofiticationResponse } from '~mocks/nofitication.mock';
import { DeleteNofitication } from '../delete-nofitication';
import { BaseQueue } from '~services/queues/base.queue';

jest.useFakeTimers();
jest.mock('~services/queues/nofitication.queue');
jest.mock('~services/queues/base.queue');

Object.defineProperties(socketServer, {
  socketIONofitcationObject: {
    value: new Server(),
    writable: true
  }
});
const NOFITICATION_ID = '64eacccb8c682cf6f21fc7aa';

describe('Delete Nofitication', () => {
  it('Should send correct json response', async () => {
    const req: Request = mockNofiticationRequest({ nofiticationId: NOFITICATION_ID });
    const res: Response = mockNofiticationResponse();

    jest.spyOn(socketServer.socketIONofitcationObject, 'emit');
    jest.spyOn(nofiticationQueue, 'addNofiticationJob');
    await DeleteNofitication.prototype.delete(req, res);

    expect(socketServer.socketIONofitcationObject.emit).toHaveBeenCalledWith('delete nofitication', NOFITICATION_ID);
    expect(nofiticationQueue.addNofiticationJob).toHaveBeenCalledWith('deleteNofitication', { key: NOFITICATION_ID });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Nofitication deleted successfully' });
  });
});
