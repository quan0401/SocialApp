import express, { Express } from 'express';
import { ChattyServer } from '~/setupServer';
import databaseConnection from '~/setupDatabase';
import { config } from '~/config';
import Logger from 'bunyan';
const log: Logger = config.createLogger('app');

class Application {
  public async initialize(): Promise<void> {
    this.loadConfig();
    await databaseConnection();
    const app: Express = express();
    const server: ChattyServer = new ChattyServer(app);
    server.start();
    Application.handleExit();
  }

  private static handleExit(): void {
    process.on('uncaughtException', (err: Error, origin) => {
      log.error(`There was an uncaught error: ${err}`);
      Application.shutDownProperly(1);
    });

    process.on('unhandledRejection', (reason) => {
      log.error(`Unhandled rejection at promise: ${reason}`);
      Application.shutDownProperly(2);
    });

    process.on('SIGTERM', () => {
      log.error('Caught SIGTERM');
      Application.shutDownProperly(2);
    });

    process.on('SIGINT', () => {
      log.error('Caught SIGINT');
      Application.shutDownProperly(2);
    });

    process.on('exit', () => {
      log.error('Exiting');
    });
  }

  private static shutDownProperly(exitCode: number): void {
    Promise.resolve()
      .then(() => {
        log.info('Shutdown complete.');
        process.exit(exitCode);
      })
      .catch((error) => {
        log.error(`Error during shutdown: ${error}`);
        process.exit(1);
      });
  }

  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const application: Application = new Application();
application.initialize();
