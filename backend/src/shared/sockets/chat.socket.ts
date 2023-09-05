import { Server } from 'socket.io';
import { ISocketData } from '~user/interfaces/user.interface';

export let socketChatObject: Server;

export class SocketChat {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
    socketChatObject = io;
  }
  public listen(): void {
    this.io.on('connection', (socket) => {
      socket.on('join room', (data: ISocketData) => {
        console.log(data);
      });
    });
  }
}
