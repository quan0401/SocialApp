import { Socket, Server } from 'socket.io';
import { ISenderReceiver } from '~chat/interfaces/chat.interface';
import { connectedUsersMap } from '~sockets/user.socket';

export let socketIOChatObject: Server;

export class SocketChat {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOChatObject = io;
  }
  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('join room', (users: ISenderReceiver) => {
        const { senderId, receiverId } = users;
        const senderSocketId: string = connectedUsersMap.get(senderId) as string;
        const receiverSocketId: string = connectedUsersMap.get(receiverId) as string;
        socket.join(senderSocketId);
        socket.join(receiverSocketId);
      });
    });
  }
}
