import { Server } from 'socket.io';

export let socketImageObject: Server;

export class SocketImage {
  public listen(io: Server): void {
    socketImageObject = io;
  }
}
