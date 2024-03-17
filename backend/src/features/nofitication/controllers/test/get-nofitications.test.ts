import { Request, Response } from 'express';
import * as socketServer from '~sockets/nofitication.socket';
import { Server } from 'socket.io';
import { mockNofitication, mockNofiticationRequest, mockNofiticationResponse } from '~mocks/nofitication.mock';
import { GetNofitication } from '~nofitication/controllers/get-nofitication';
import { authUserPayload } from '~mocks/auth.mock';
import { nofiticationService } from '~services/db/nofitication.service';
import { INotificationDocument } from '~nofitication/interfaces/notification.interface';

jest.useFakeTimers();
jest.mock('~services/db/nofitication.service');

Object.defineProperties(socketServer, {
  socketIONofitcationObject: {
    value: new Server(),
    writable: true
  }
});
const NOFITICATION_ID = '64eacccb8c682cf6f21fc7aa';

describe('Get Nofitication', () => {
  it('Should send correct json response', async () => {
    const req: Request = mockNofiticationRequest({ nofiticationId: NOFITICATION_ID }, authUserPayload);
    const res: Response = mockNofiticationResponse();

    const nofitications: INotificationDocument[] = [mockNofitication];

    jest.spyOn(nofiticationService, 'getNofitications').mockResolvedValue(nofitications);
    await GetNofitication.prototype.get(req, res);

    expect(nofiticationService.getNofitications).toHaveBeenCalledWith(authUserPayload.userId);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'User nofitications', nofitications });
  });
});
