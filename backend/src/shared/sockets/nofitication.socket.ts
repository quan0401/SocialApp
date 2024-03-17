import { Server } from 'socket.io';

export let socketIONofitcationObject: Server;

export class SocketNofitication {
  public listen(io: Server): void {
    socketIONofitcationObject = io;
  }
}
