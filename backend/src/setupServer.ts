import { Application, json, urlencoded, Response, Request, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import HTTP_STATUS from 'http-status-codes';
import { Server, Socket } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import compression from 'compression';
import 'express-async-errors';
import { config } from '~/config';
import { CustomError, IErrorResponse } from '~global/helpers/error-handler';
import applicationRoutes from '~/routes';

import Logger from 'bunyan';
import { SocketIOPostHandler } from '~sockets/post.socket';
import { SocketIOFollowerHandler } from '~sockets/follower.socket';
import { SocketIOUserHandler } from '~sockets/user.socket';
import { SocketNofitication } from '~sockets/nofitication.socket';
import { SocketImage } from '~sockets/image.socket';
import { SocketChat } from '~sockets/chat.socket';

const SERVER_PORT = 5001;
const log: Logger = config.createLogger('server');

export class ChattyServer {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routeMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }

  private securityMiddleware(app: Application): void {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_ONE, config.SECRET_KEY_TWO],
        maxAge: 3600 * 1000,
        secure: config.NODE_ENV !== 'development'
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URI,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(app: Application): void {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routeMiddleware(app: Application): void {
    applicationRoutes(app);
  }

  private globalErrorHandler(app: Application): void {
    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, req: Request, res: Response, next: NextFunction) => {
      log.error(error);

      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketIO);
    } catch (error) {
      log.error(error);
    }
  }
  // Use server from socket.io instead of from http so as to not create conflict

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io = new Server(httpServer, {
      cors: {
        origin: config.CLIENT_URI,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startHttpServer(httpServer: http.Server): void {
    log.info(`Server start on process ${process.pid}`);
    httpServer.listen(SERVER_PORT, () => {
      log.info('Server is running on port ', SERVER_PORT);
    });
  }

  private socketIOConnections(io: Server): void {
    const socketIOPostHandler: SocketIOPostHandler = new SocketIOPostHandler(io);
    const socketIOFollowerHandler: SocketIOFollowerHandler = new SocketIOFollowerHandler(io);
    const socketIOUser: SocketIOUserHandler = new SocketIOUserHandler(io);
    const socketIONofitcation: SocketNofitication = new SocketNofitication();
    const socketIOImage: SocketImage = new SocketImage();
    const socketIOChat: SocketChat = new SocketChat(io);

    socketIOPostHandler.listen();
    socketIOFollowerHandler.listen();
    socketIOUser.listen();
    socketIONofitcation.listen(io);
    socketIOImage.listen(io);
    socketIOChat.listen();
  }
}
