import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { nofiticationQueue } from '~services/queues/nofitication.queue';
import * as socketServer from '~sockets/nofitication.socket';
import { UpdateNofitication } from '../update-nofitication'; // Make sure to import the correct file path
import { mockNofiticationRequest, mockNofiticationResponse } from '~mocks/nofitication.mock';
import { Server } from 'socket.io';

jest.useFakeTimers();
jest.mock('~services/queues/nofitication.queue');
jest.mock('~services/queues/base.queue');
jest.mock('~sockets/nofitication.socket');

const NOFITICATION_ID = '64eacccb8c682cf6f21fc7aa';
Object.defineProperties(socketServer, {
  socketIONofitcationObject: {
    value: new Server(),
    writable: true
  }
});

describe('UpdateNofitication', () => {
  it('Should send correct json response', async () => {
    const req: Request = mockNofiticationRequest({ nofiticationId: NOFITICATION_ID }); // Replace with a mock request
    const res: Response = mockNofiticationResponse(); // Replace with a mock response

    jest.spyOn(socketServer.socketIONofitcationObject, 'emit');
    jest.spyOn(nofiticationQueue, 'addNofiticationJob');

    const updateNofitication = new UpdateNofitication();
    await updateNofitication.update(req, res);

    expect(socketServer.socketIONofitcationObject.emit).toHaveBeenCalledWith('update nofitication', expect.any(String));
    expect(nofiticationQueue.addNofiticationJob).toHaveBeenCalledWith('updateNofitication', { key: expect.any(String) });
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({ message: 'Nofitication marked as read' });
  });
});
