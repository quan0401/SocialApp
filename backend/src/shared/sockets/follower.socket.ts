import { Server } from 'socket.io';
import { IFollower } from '~follower/interfaces/follower.interface';
export let socketIOFollowerObject: Server;

export class SocketIOFollowerHandler {
  private io: Server;
  constructor(io: Server) {
    this.io = io;
    socketIOFollowerObject = io;
  }
  public listen() {
    this.io.on('connection', (socket) => {
      socket.on('unfollow user', (user: IFollower) => {
        this.io.emit('remove user', user);
      });
    });
  }
}
